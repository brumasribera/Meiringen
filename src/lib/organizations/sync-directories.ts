import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "../supabase/server";
import { slugify } from "../utils";
import type { Locality, OrganizationCategory } from "../constants";
import { evaluateOrganizationCandidate } from "../curation/quality";

type DirectorySource = "meiringen_ch" | "haslital_brienz";

type DirectoryOrganization = {
  name: string;
  sourceUrl: string;
  directorySourceUrl: string;
  websiteUrl: string | null;
  email: string | null;
  phone: string | null;
  category: OrganizationCategory;
  locality: Locality | null;
};

type ExistingOrganization = {
  id: string;
  name: string;
  slug: string;
  source_url: string | null;
  website_url: string | null;
  email: string | null;
  phone: string | null;
  category: OrganizationCategory;
  status: "draft" | "published" | "archived";
  directory_source_url: string | null;
  directory_missing_since: string | null;
};

type SourceResult = {
  source: DirectorySource;
  url: string;
  fetched: boolean;
  found: number;
  inserted: number;
  updated: number;
  rejected: number;
  markedMissing: number;
  archived: number;
};

export type OrganizationDirectorySyncResult = {
  inserted: number;
  updated: number;
  rejected: number;
  markedMissing: number;
  archived: number;
  sources: SourceResult[];
  syncedAt: string;
};

const MEIRINGEN_DIRECTORY_URL = "https://www.meiringen.ch/vereinsliste";
const HASLITAL_DIRECTORY_URL = "https://www.haslital-brienz.ch/vereine";
const MISSING_GRACE_DAYS = 30;

const CATEGORY_MAP: Record<string, OrganizationCategory> = {
  kultur: "culture",
  musik: "music",
  sport: "sport",
  soziales_gesundheit: "social",
  bildung: "education",
  natur: "nature",
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Meiringen.life Bot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return response.text();
  } catch (error) {
    console.error(`syncOrganizationDirectories fetch ${url}:`, error);
    return null;
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(value: string): string {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(
  value: string | null | undefined,
  baseUrl: string,
): string | null {
  if (!value) return null;
  try {
    const url = new URL(decodeHtml(value.trim()), baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeKey(value: string): string {
  return slugify(value.replace(/\b(verein|club|sektion)\b/gi, "").trim());
}

function inferLocality(text: string): Locality | null {
  const value = text.toLowerCase();
  const localities: Locality[] = [
    "brienzwiler",
    "innertkirchen",
    "schattenhalb",
    "hasliberg",
    "guttannen",
    "schwanden",
    "hofstetten",
    "oberried",
    "willigen",
    "gadmen",
    "brienz",
    "meiringen",
    "hausen",
    "balm",
  ];
  return localities.find((locality) => value.includes(locality)) ?? null;
}

function inferCategory(
  name: string,
  fallback?: string | null,
): OrganizationCategory {
  if (fallback && CATEGORY_MAP[fallback]) return CATEGORY_MAP[fallback];
  const text = name.toLowerCase();
  if (/(chor|jodler|musik|harmonika|kapelle)/.test(text)) return "music";
  if (
    /(turn|ski|club|sport|fussball|schwing|tennis|curling|karate|kanu|reit)/.test(
      text,
    )
  )
    return "sport";
  if (/(natur|fischer|sac|wander)/.test(text)) return "nature";
  if (/(schule|kindergarten|bildung)/.test(text)) return "education";
  if (/(theater|museum|kultur|tracht)/.test(text)) return "culture";
  if (/(samariter|frauenverein|beratung|procap|gemeinnutz)/.test(text))
    return "social";
  return "other";
}

function extractWebsite(html: string): string | null {
  const patterns = [
    /Homepage[\s\S]{0,120}?href=["'](https?:\/\/[^"']+)["']/i,
    /Website[\s\S]{0,120}?href=["'](https?:\/\/[^"']+)["']/i,
    /Webseite[\s\S]{0,120}?href=["'](https?:\/\/[^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1] && !match[1].includes("meiringen.ch")) return match[1];
  }

  const externalLinks = [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((url) => {
      const lower = url.toLowerCase();
      return (
        !lower.includes("meiringen.ch") &&
        !lower.includes("facebook.com/plugins") &&
        !lower.includes("google") &&
        !lower.includes("youtube.com/embed") &&
        !lower.endsWith(".css") &&
        !lower.endsWith(".js")
      );
    });
  return externalLinks[0] ?? null;
}

async function parseMeiringenDirectory(): Promise<
  DirectoryOrganization[] | null
> {
  const html = await fetchHtml(MEIRINGEN_DIRECTORY_URL);
  if (!html) return null;

  const decodedHtml = decodeHtml(html);
  const entries: DirectoryOrganization[] = [];
  const entryRegex =
    /{"name":"([\s\S]*?)","name-sort"[\s\S]*?"ort":"([\s\S]*?)"[\s\S]*?"email":"([\s\S]*?)"[\s\S]*?"telefon":"([\s\S]*?)"[\s\S]*?"kategorieId":"([^"]*)"[\s\S]*?}/g;

  let match;
  while ((match = entryRegex.exec(decodedHtml)) !== null) {
    const nameHtml = decodeHtml(match[1]);
    const linkMatch = nameHtml.match(/href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    const sourceUrl = absoluteUrl(linkMatch?.[1], MEIRINGEN_DIRECTORY_URL);
    const name = stripTags(linkMatch?.[2] ?? nameHtml);
    if (!sourceUrl || !name) continue;

    entries.push({
      name,
      sourceUrl,
      directorySourceUrl: MEIRINGEN_DIRECTORY_URL,
      websiteUrl: null,
      email: stripTags(match[3]).match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0] ?? null,
      phone: stripTags(match[4]) || null,
      category: inferCategory(name, match[5]),
      locality: inferLocality(`${name} ${stripTags(match[2])}`) ?? "meiringen",
    });
  }

  await mapWithConcurrency(entries, 4, async (entry) => {
    const detailHtml = await fetchHtml(entry.sourceUrl);
    entry.websiteUrl = detailHtml
      ? absoluteUrl(extractWebsite(detailHtml), entry.sourceUrl)
      : null;
  });

  return dedupeDirectoryOrganizations(entries);
}

function parseHaslitalDirectoryRows(html: string): DirectoryOrganization[] {
  const rows = [
    ...html.matchAll(/<tr\b[^>]*role="row"[^>]*>([\s\S]*?)<\/tr>/gi),
  ];
  const entries: DirectoryOrganization[] = [];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (cell) => cell[1],
    );
    if (cells.length < 2) continue;

    const firstLink = cells[0].match(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/i,
    );
    const secondLink = cells[1].match(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/i,
    );
    const name = stripTags(cells[0]);
    if (!name || name.length < 3 || /^name$/i.test(name)) continue;

    const websiteUrl =
      absoluteUrl(firstLink?.[1], HASLITAL_DIRECTORY_URL) ??
      absoluteUrl(secondLink?.[1], HASLITAL_DIRECTORY_URL);
    const email =
      row[1].match(/href=["']mailto:\s*([^"']+)["']/i)?.[1]?.trim() ?? null;
    const phone =
      stripTags(cells[3] ?? "")
        .match(/\+?\d[\d\s/().-]{5,}/)?.[0]
        ?.trim() ?? null;

    entries.push({
      name,
      sourceUrl: websiteUrl ?? `${HASLITAL_DIRECTORY_URL}#${slugify(name)}`,
      directorySourceUrl: HASLITAL_DIRECTORY_URL,
      websiteUrl,
      email,
      phone,
      category: inferCategory(name),
      locality: inferLocality(name),
    });
  }

  return dedupeDirectoryOrganizations(entries);
}

async function parseHaslitalDirectory(): Promise<
  DirectoryOrganization[] | null
> {
  const html = await fetchHtml(HASLITAL_DIRECTORY_URL);
  return html ? parseHaslitalDirectoryRows(html) : null;
}

function dedupeDirectoryOrganizations(entries: DirectoryOrganization[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.directorySourceUrl}|${normalizeKey(entry.name)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  callback: (item: T) => Promise<void>,
) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      await callback(item);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

async function loadExistingOrganizations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, source_url, website_url, email, phone, category, status, directory_source_url, directory_missing_since",
    );
  if (error) throw new Error(error.message);
  return (data ?? []) as ExistingOrganization[];
}

function findExisting(
  entry: DirectoryOrganization,
  existing: ExistingOrganization[],
): ExistingOrganization | null {
  const entrySlug = slugify(entry.name);
  const entryKey = normalizeKey(entry.name);
  return (
    existing.find((org) => org.source_url === entry.sourceUrl) ??
    existing.find((org) => org.slug === entrySlug) ??
    existing.find((org) => normalizeKey(org.name) === entryKey) ??
    null
  );
}

function mergeExistingPayload(
  entry: DirectoryOrganization,
  existing: ExistingOrganization,
) {
  return {
    source_url: existing.source_url ?? entry.sourceUrl,
    directory_source_url: entry.directorySourceUrl,
    directory_last_seen_at: new Date().toISOString(),
    directory_missing_since: null,
    website_url: existing.website_url ?? entry.websiteUrl,
    email: existing.email ?? entry.email,
    phone: existing.phone ?? entry.phone,
    locality: entry.locality,
    status: existing.status === "archived" ? "draft" : existing.status,
  };
}

function newOrganizationPayload(entry: DirectoryOrganization) {
  return {
    name: entry.name,
    slug: slugify(entry.name),
    description: null,
    category: entry.category,
    website_url: entry.websiteUrl,
    email: entry.email,
    phone: entry.phone,
    address: null,
    locality: entry.locality,
    languages: ["de"],
    source_url: entry.sourceUrl,
    status: "draft",
    directory_source_url: entry.directorySourceUrl,
    directory_last_seen_at: new Date().toISOString(),
    directory_missing_since: null,
  };
}

async function reconcileSource(
  supabase: SupabaseClient,
  source: DirectorySource,
  url: string,
  entries: DirectoryOrganization[] | null,
  existing: ExistingOrganization[],
): Promise<SourceResult> {
  const result: SourceResult = {
    source,
    url,
    fetched: entries !== null,
    found: entries?.length ?? 0,
    inserted: 0,
    updated: 0,
    rejected: 0,
    markedMissing: 0,
    archived: 0,
  };

  if (!entries) return result;

  const seenIds = new Set<string>();
  for (const entry of entries) {
    const quality = evaluateOrganizationCandidate({
      name: entry.name,
      category: entry.category,
      website_url: entry.websiteUrl,
      source_url: entry.sourceUrl,
      locality: entry.locality,
    });
    if (!quality.accepted) {
      result.rejected++;
      continue;
    }

    const match = findExisting(entry, existing);
    if (match) {
      seenIds.add(match.id);
      const { error } = await supabase
        .from("organizations")
        .update(mergeExistingPayload(entry, match))
        .eq("id", match.id);
      if (error) throw new Error(error.message);
      result.updated++;
      continue;
    }

    const { error } = await supabase
      .from("organizations")
      .insert(newOrganizationPayload(entry));
    if (error?.code === "23505") {
      continue;
    }
    if (error) throw new Error(error.message);
    result.inserted++;
  }

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - MISSING_GRACE_DAYS);

  const sourceBacked = existing.filter(
    (org) =>
      org.directory_source_url === url ||
      org.source_url?.startsWith(`${url}/`) ||
      org.source_url?.startsWith(`${url}#`),
  );

  for (const org of sourceBacked) {
    if (seenIds.has(org.id) || org.status === "archived") continue;

    if (!org.directory_missing_since) {
      const { error } = await supabase
        .from("organizations")
        .update({ directory_missing_since: new Date().toISOString() })
        .eq("id", org.id);
      if (error) throw new Error(error.message);
      result.markedMissing++;
      continue;
    }

    if (new Date(org.directory_missing_since) <= cutoff) {
      const { error } = await supabase
        .from("organizations")
        .update({ status: "archived" })
        .eq("id", org.id);
      if (error) throw new Error(error.message);
      result.archived++;
    }
  }

  return result;
}

export async function syncOrganizationDirectories(): Promise<OrganizationDirectorySyncResult> {
  const supabase = await createServiceClient();
  const [meiringenEntries, haslitalEntries] = await Promise.all([
    parseMeiringenDirectory(),
    parseHaslitalDirectory(),
  ]);

  const meiringenResult = await reconcileSource(
    supabase,
    "meiringen_ch",
    MEIRINGEN_DIRECTORY_URL,
    meiringenEntries,
    await loadExistingOrganizations(supabase),
  );
  const haslitalResult = await reconcileSource(
    supabase,
    "haslital_brienz",
    HASLITAL_DIRECTORY_URL,
    haslitalEntries,
    await loadExistingOrganizations(supabase),
  );
  const sources = [meiringenResult, haslitalResult];

  return {
    inserted: sources.reduce((sum, source) => sum + source.inserted, 0),
    updated: sources.reduce((sum, source) => sum + source.updated, 0),
    rejected: sources.reduce((sum, source) => sum + source.rejected, 0),
    markedMissing: sources.reduce(
      (sum, source) => sum + source.markedMissing,
      0,
    ),
    archived: sources.reduce((sum, source) => sum + source.archived, 0),
    sources,
    syncedAt: new Date().toISOString(),
  };
}
