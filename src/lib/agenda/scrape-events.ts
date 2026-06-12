import { createServiceClient } from "@/lib/supabase/server";
import { runParser } from "@/lib/scraping/parsers";
import type { ScrapedEvent } from "@/lib/scraping/generic-parser";
import type { SupabaseClient } from "@supabase/supabase-js";
import { agendaHorizonDate, isWithinAgendaHorizon } from "./constants";
import { buildOccurrenceSlug } from "./expand-recurrence";

type ScrapeSource = {
  id: string;
  name: string;
  url: string;
  type: string;
};

type ScrapeResult = {
  imported: number;
  skipped: number;
  sources: number;
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
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, website_url")
    .not("website_url", "is", null);

  const hosts = new Map<string, string>();
  for (const org of organizations ?? []) {
    const host = org.website_url ? hostnameFromUrl(org.website_url) : null;
    if (host) hosts.set(host, org.id);
  }
  return hosts;
}

function resolveOrganizationId(
  event: ScrapedEvent,
  sourceUrl: string,
  hosts: Map<string, string>
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
      headers: { "User-Agent": "Meiringen.org Bot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return response.text();
  } catch (error) {
    console.error(`fetchHtml ${url}:`, error);
    return null;
  }
}

export async function scrapeActivitySources(
  supabase: SupabaseClient
): Promise<ScrapeResult> {
  const now = new Date();
  const horizon = agendaHorizonDate(now);
  let imported = 0;
  let skipped = 0;

  const [{ data: sources }, hosts] = await Promise.all([
    supabase.from("scraping_sources").select("*").eq("active", true),
    loadOrganizationHosts(supabase),
  ]);

  const { data: orgWebsites } = await supabase
    .from("organizations")
    .select("id, name, website_url")
    .not("website_url", "is", null);

  const dynamicSources: ScrapeSource[] = (orgWebsites ?? [])
    .filter((org) => org.website_url)
    .map((org) => ({
      id: `org-${org.id}`,
      name: org.name,
      url: org.website_url as string,
      type: "generic",
    }));

  const orgBatchSize = 12;
  const dayIndex = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const orgBatchStart = (dayIndex * orgBatchSize) % Math.max(dynamicSources.length, 1);
  const rotatedOrgSources =
    dynamicSources.length <= orgBatchSize
      ? dynamicSources
      : [
          ...dynamicSources.slice(orgBatchStart),
          ...dynamicSources.slice(0, orgBatchStart),
        ].slice(0, orgBatchSize);

  const seenUrls = new Set<string>();
  const allSources = [...(sources ?? []), ...rotatedOrgSources].filter((source) => {
    const key = source.url.replace(/\/$/, "");
    if (seenUrls.has(key)) return false;
    seenUrls.add(key);
    return true;
  });

  for (const source of allSources) {
    const html = await fetchHtml(source.url);
    if (!html) continue;

    const events = await runParser(source.type, source.url, html);

    for (const event of events) {
      if (!isWithinAgendaHorizon(event.start_date, now)) {
        skipped++;
        continue;
      }

      const slug = buildOccurrenceSlug(event.title, event.start_date);
      const organizationId = resolveOrganizationId(event, source.url, hosts);

      const { error: insertError } = await supabase.from("events").insert({
        organization_id: organizationId,
        title: event.title,
        slug,
        description: event.description,
        category: event.category,
        start_date: event.start_date,
        end_date: event.end_date,
        location_name: event.location_name,
        address: event.address,
        source_url: event.source_url,
        is_recurring: false,
        is_recurring_template: false,
        recurrence_interval_days: 7,
        status: "published",
      });

      if (insertError?.code === "23505") {
        skipped++;
      } else if (insertError) {
        console.error("scrapeActivitySources insert:", insertError.message);
      } else {
        imported++;
      }
    }

    if (!source.id.startsWith("org-")) {
      await supabase
        .from("scraping_sources")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("id", source.id);
    }
  }

  return { imported, skipped, sources: allSources.length, horizon: horizon.toISOString() };
}

export async function syncAgenda() {
  const supabase = await createServiceClient();
  const scraped = await scrapeActivitySources(supabase);
  const { expandRecurringEvents } = await import("./expand-recurrence");
  const expanded = await expandRecurringEvents(supabase);

  return {
    scraped,
    expanded,
    syncedAt: new Date().toISOString(),
  };
}
