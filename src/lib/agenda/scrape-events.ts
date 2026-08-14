import { createServiceClient } from "../supabase/server";
import { runParser } from "../scraping/parsers";
import type { ScrapedEvent } from "../scraping/generic-parser";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { agendaHorizonDate, isWithinAgendaHorizon } from "./constants";
import { buildOccurrenceSlug } from "./expand-recurrence";
import {
  evaluateEventCandidate,
  shouldDeleteScrapedEvent,
} from "../curation/quality";

type ScrapeSource = {
  id: string;
  name: string;
  url: string;
  type: string;
  organizationId: string | null;
  isOrganizationSource: boolean;
};

type ScrapeResult = {
  imported: number;
  updated: number;
  skipped: number;
  rejected: number;
  deleted: number;
  drafted: number;
  sources: number;
  pages: number;
  horizon: string;
};

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function loadOrganizationHosts(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, website_url")
    .not("website_url", "is", null);

  const hostCounts = new Map<string, number>();
  const hostIds = new Map<string, string>();
  for (const org of organizations ?? []) {
    const host = org.website_url ? hostnameFromUrl(org.website_url) : null;
    if (!host) continue;
    hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
    hostIds.set(host, org.id);
  }

  const hosts = new Map<string, string>();
  for (const [host, count] of hostCounts) {
    if (count === 1 && !BROAD_HOSTS_REQUIRING_REGIONAL_MATCH.has(host)) {
      hosts.set(host, hostIds.get(host)!);
    }
  }
  return hosts;
}

function resolveOrganizationId(
  event: ScrapedEvent,
  sourceUrl: string,
  hosts: Map<string, string>,
): string | null {
  for (const candidate of [event.source_url, sourceUrl]) {
    const host = hostnameFromUrl(candidate);
    if (host && hosts.has(host)) {
      return hosts.get(host) ?? null;
    }
  }
  return null;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Meiringen.life Bot/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return response.text();
  } catch (error) {
    console.error(`fetchHtml ${url}:`, error);
    return null;
  }
}

function sameHost(left: string, right: string): boolean {
  const leftHost = hostnameFromUrl(left);
  const rightHost = hostnameFromUrl(right);
  return Boolean(leftHost && rightHost && leftHost === rightHost);
}

function absoluteUrl(value: string, baseUrl: string): string | null {
  try {
    const url = new URL(value, baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function discoverEventPageUrls(baseUrl: string, html: string): string[] {
  const candidatePattern =
    /(agenda|anlaesse|anlässe|event|events|veranstaltung|veranstaltungen|termine|kalender|programm|jahresprogramm|spielplan)/i;
  const links: string[] = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = decodeHtml(match[1]);
    const text = stripTags(decodeHtml(match[2]));
    if (!candidatePattern.test(`${href} ${text}`)) continue;

    const url = absoluteUrl(href, baseUrl);
    if (url && sameHost(url, baseUrl)) links.push(url);
  }

  return Array.from(new Set(links)).slice(0, 8);
}

async function collectSourcePages(
  source: ScrapeSource,
): Promise<Array<{ url: string; html: string }>> {
  const homeHtml = await fetchHtml(source.url);
  if (!homeHtml) return [];

  const pages = [{ url: source.url, html: homeHtml }];
  const eventUrls = discoverEventPageUrls(source.url, homeHtml);

  for (const url of eventUrls) {
    const html = await fetchHtml(url);
    if (html) pages.push({ url, html });
  }

  return pages;
}

function shortHash(value: string): string {
  return createHash("sha1").update(value).digest("hex").slice(0, 8);
}

const BROAD_HOSTS_REQUIRING_REGIONAL_MATCH = new Set([
  "interlaken.swiss",
  "jungfrau.ch",
  "mvb-be.ch",
  "procap.ch",
  "sac-cas.ch",
  "schweizerjodel.ch",
  "thunersee.ch",
]);

const REGIONAL_EVENT_PATTERN =
  /(meiringen|haslital|oberhasli|brienz|brienzwiler|brienzersee|innertkirchen|hasliberg|schattenhalb|guttannen|gadmen|willigen|hofstetten|schwanden|oberried|unterbach|balm|hausen|ballenberg|axalp|reuti|hasliberg)/i;

function isBroadHost(url: string): boolean {
  const host = hostnameFromUrl(url);
  return Boolean(host && BROAD_HOSTS_REQUIRING_REGIONAL_MATCH.has(host));
}

function isKinoMeiringenSource(url: string): boolean {
  const host = hostnameFromUrl(url);
  return host === "kino-meiringen.ch";
}

function isRegionallyRelevant(
  event: ScrapedEvent,
  sourceUrl: string,
  sourceSiteUrl: string,
): boolean {
  if (!isBroadHost(sourceUrl) && !isBroadHost(sourceSiteUrl)) return true;

  return REGIONAL_EVENT_PATTERN.test(
    [
      event.title,
      event.description,
      event.location_name,
      event.address,
      sourceUrl,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

async function saveScrapedEvent(
  supabase: SupabaseClient,
  event: ScrapedEvent,
  source: ScrapeSource,
  hosts: Map<string, string>,
): Promise<"imported" | "updated" | "skipped" | "rejected"> {
  const sourceUrl = absoluteUrl(event.source_url, source.url);
  if (!sourceUrl || !isWithinAgendaHorizon(event.start_date)) return "skipped";
  if (!isRegionallyRelevant(event, sourceUrl, source.url)) return "skipped";

  const quality = evaluateEventCandidate({
    ...event,
    source_url: sourceUrl,
    sourceName: source.name,
    siteUrl: source.url,
  });
  if (!quality.accepted) return "rejected";

  const kinoMeiringenEvent =
    isKinoMeiringenSource(sourceUrl) ||
    /kino\s*\+?|kino-meiringen|cinema/i.test(
      [event.title, event.description, source.name, source.url]
        .filter(Boolean)
        .join(" "),
    );

  const organizationId =
    source.organizationId ??
    resolveOrganizationId(
      { ...event, source_url: sourceUrl },
      source.url,
      hosts,
    );
  const slug = buildOccurrenceSlug(event.title, event.start_date);
  const payload = {
    organization_id: organizationId,
    title: event.title,
    description: event.description,
    category: kinoMeiringenEvent ? "cinema" : event.category,
    start_date: event.start_date,
    end_date: event.end_date,
    location_name: event.location_name,
    address: event.address,
    source_url: sourceUrl,
    is_recurring: false,
    is_recurring_template: false,
    status: "published",
  };

  const { data: existing, error: lookupError } = await supabase
    .from("events")
    .select("id")
    .eq("source_url", sourceUrl)
    .eq("title", event.title)
    .eq("start_date", event.start_date)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("saveScrapedEvent lookup:", lookupError.message);
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      console.error("saveScrapedEvent update:", error.message);
      return "skipped";
    }
    return "updated";
  }

  const { data: duplicate, error: duplicateLookupError } = await supabase
    .from("events")
    .select("id")
    .eq("title", event.title)
    .eq("start_date", event.start_date)
    .limit(1)
    .maybeSingle();

  if (duplicateLookupError) {
    console.error(
      "saveScrapedEvent duplicate lookup:",
      duplicateLookupError.message,
    );
  }

  if (duplicate?.id) return "skipped";

  const { error: insertError } = await supabase.from("events").insert({
    ...payload,
    slug,
  });

  if (!insertError) return "imported";
  if (insertError.code !== "23505") {
    console.error("saveScrapedEvent insert:", insertError.message);
    return "skipped";
  }

  const { error: retryError } = await supabase.from("events").insert({
    ...payload,
    slug: `${slug}-${shortHash(sourceUrl)}`,
  });

  if (retryError?.code === "23505") return "skipped";
  if (retryError) {
    console.error("saveScrapedEvent retry:", retryError.message);
    return "skipped";
  }

  return "imported";
}

type CleanupEventRow = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  location_name: string | null;
  address: string | null;
  source_url: string | null;
};

async function cleanupSenselessEvents(supabase: SupabaseClient) {
  const now = new Date();
  const horizon = agendaHorizonDate(now);
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, description, category, start_date, end_date, location_name, address, source_url",
    )
    .eq("status", "published")
    .eq("is_recurring_template", false)
    .gte("start_date", now.toISOString())
    .lte("start_date", horizon.toISOString())
    .limit(1000);

  if (error) {
    console.error("cleanupSenselessEvents lookup:", error.message);
    return { reviewed: 0, deleted: 0, drafted: 0 };
  }

  const deleteIds: string[] = [];
  const draftIds: string[] = [];
  for (const row of (data ?? []) as CleanupEventRow[]) {
    const decision = shouldDeleteScrapedEvent(row);
    if (!decision.accepted) {
      if (row.source_url) deleteIds.push(row.id);
      else draftIds.push(row.id);
    }
  }

  for (let index = 0; index < deleteIds.length; index += 100) {
    const ids = deleteIds.slice(index, index + 100);
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .in("id", ids);
    if (deleteError) {
      console.error("cleanupSenselessEvents delete:", deleteError.message);
      return { reviewed: data?.length ?? 0, deleted: index, drafted: 0 };
    }
  }

  for (let index = 0; index < draftIds.length; index += 100) {
    const ids = draftIds.slice(index, index + 100);
    const { error: draftError } = await supabase
      .from("events")
      .update({ status: "draft" })
      .in("id", ids);
    if (draftError) {
      console.error("cleanupSenselessEvents draft:", draftError.message);
      return {
        reviewed: data?.length ?? 0,
        deleted: deleteIds.length,
        drafted: index,
      };
    }
  }

  return {
    reviewed: data?.length ?? 0,
    deleted: deleteIds.length,
    drafted: draftIds.length,
  };
}

export async function scrapeActivitySources(
  supabase: SupabaseClient,
): Promise<ScrapeResult> {
  const now = new Date();
  const horizon = agendaHorizonDate(now);
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let rejected = 0;
  let pagesChecked = 0;

  const [{ data: sources }, hosts] = await Promise.all([
    supabase.from("scraping_sources").select("*").eq("active", true),
    loadOrganizationHosts(supabase),
  ]);

  const { data: orgWebsites } = await supabase
    .from("organizations")
    .select("id, name, website_url")
    .not("website_url", "is", null);

  const websiteCounts = new Map<string, number>();
  for (const org of orgWebsites ?? []) {
    const key = org.website_url ? org.website_url.replace(/\/$/, "") : null;
    if (key) websiteCounts.set(key, (websiteCounts.get(key) ?? 0) + 1);
  }

  const dynamicSources: ScrapeSource[] = (orgWebsites ?? [])
    .filter((org) => org.website_url)
    .map((org) => {
      const key = (org.website_url as string).replace(/\/$/, "");
      return {
        id: `org-${org.id}`,
        name: org.name,
        url: org.website_url as string,
        type: "generic",
        organizationId:
          websiteCounts.get(key) === 1 &&
          !isBroadHost(org.website_url as string)
            ? org.id
            : null,
        isOrganizationSource: true,
      };
    });

  const seenUrls = new Set<string>();
  const configuredSources: ScrapeSource[] = (sources ?? []).map((source) => ({
    ...source,
    organizationId: null,
    isOrganizationSource: false,
  }));
  const allSources = [...configuredSources, ...dynamicSources].filter(
    (source) => {
      const key = source.url.replace(/\/$/, "");
      if (seenUrls.has(key)) return false;
      seenUrls.add(key);
      return true;
    },
  );

  const workerCount = 4;
  let cursor = 0;

  async function worker() {
    while (cursor < allSources.length) {
      const source = allSources[cursor++];
      const pages = await collectSourcePages(source);
      pagesChecked += pages.length;

      for (const page of pages) {
        const events = await runParser(source.type, page.url, page.html);
        for (const event of events) {
          const result = await saveScrapedEvent(supabase, event, source, hosts);
          if (result === "imported") imported++;
          else if (result === "updated") updated++;
          else if (result === "rejected") rejected++;
          else skipped++;
        }
      }

      if (!source.isOrganizationSource) {
        await supabase
          .from("scraping_sources")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", source.id);
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  const cleanup = await cleanupSenselessEvents(supabase);

  return {
    imported,
    updated,
    skipped,
    rejected,
    deleted: cleanup.deleted,
    drafted: cleanup.drafted,
    sources: allSources.length,
    pages: pagesChecked,
    horizon: horizon.toISOString(),
  };
}

export async function syncAgenda() {
  const supabase = await createServiceClient();
  const scraped = await scrapeActivitySources(supabase);

  return {
    scraped,
    syncedAt: new Date().toISOString(),
  };
}
