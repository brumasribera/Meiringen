import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { buildOccurrenceSlug } from "../agenda/expand-recurrence";
import type { ContentLanguage, Locality } from "../constants";
import { slugify } from "../utils";
import {
  shouldPublishEvent,
  evaluateOrganizationCandidate,
  normalizeEventCategory,
  normalizeOrganizationCategory,
} from "./quality";
import { withEventImageIfSupported } from "../event-images";

type CuratedOrganization = {
  name?: string | null;
  description?: string | null;
  description_en?: string | null;
  category?: string | null;
  website_url?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  locality?: string | null;
  source_url?: string | null;
  languages?: string[] | null;
  confidence?: number | null;
};

type CuratedEvent = {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location_name?: string | null;
  address?: string | null;
  price?: string | null;
  language?: string | null;
  image_url?: string | null;
  source_url?: string | null;
  organization_name?: string | null;
  organization_website_url?: string | null;
  organization_source_url?: string | null;
  confidence?: number | null;
};

export type CuratedScrapeResult = {
  organizations?: CuratedOrganization[] | null;
  events?: CuratedEvent[] | null;
};

export type CuratedImportResult = {
  organizations: {
    inserted: number;
    updated: number;
    skipped: number;
    rejected: number;
  };
  events: {
    imported: number;
    updated: number;
    skipped: number;
    rejected: number;
  };
  syncedAt: string;
};

type ExistingOrganization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_en: string | null;
  website_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  source_url: string | null;
  status: "draft" | "published" | "archived";
};

function cleanString(value: string | null | undefined): string | null {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned || null;
}

function normalizeUrl(value: string | null | undefined): string | null {
  const cleaned = cleanString(value);
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeConfidence(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function shortHash(value: string): string {
  return createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function normalizeLanguages(
  value: string[] | null | undefined,
): ContentLanguage[] {
  const supported = new Set([
    "de",
    "gsw",
    "en",
    "fr",
    "it",
    "rm",
    "pt",
    "es",
    "ca",
  ]);
  const languages = (value ?? []).filter((language) => supported.has(language));
  return languages.length > 0 ? (languages as ContentLanguage[]) : ["de"];
}

function normalizeEventLanguage(
  value: string | null | undefined,
): string | null {
  const supported = new Set(["de", "gsw", "en", "fr", "it", "rm", "pt"]);
  const cleaned = cleanString(value);
  return cleaned && supported.has(cleaned) ? cleaned : null;
}

function normalizeIsoDate(value: string | null | undefined): string | null {
  const cleaned = cleanString(value);
  if (!cleaned) return null;
  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeLocality(value: string | null | undefined): Locality | null {
  const localities = new Set([
    "balm",
    "brienz",
    "brienzwiler",
    "gadmen",
    "guttannen",
    "hasliberg",
    "hausen",
    "hofstetten",
    "innertkirchen",
    "meiringen",
    "oberried",
    "schattenhalb",
    "schwanden",
    "willigen",
  ]);
  const cleaned = cleanString(value)?.toLowerCase();
  return cleaned && localities.has(cleaned) ? (cleaned as Locality) : null;
}

async function findExistingOrganization(
  supabase: SupabaseClient,
  candidate: {
    slug?: string | null;
    sourceUrl?: string | null;
    websiteUrl?: string | null;
    name?: string | null;
  },
): Promise<ExistingOrganization | null> {
  const select =
    "id, name, slug, description, description_en, website_url, email, phone, address, source_url, status";

  for (const [column, value] of [
    ["source_url", candidate.sourceUrl],
    ["website_url", candidate.websiteUrl],
    ["slug", candidate.slug],
  ] as const) {
    if (!value) continue;
    const { data } = await supabase
      .from("organizations")
      .select(select)
      .eq(column, value)
      .limit(1)
      .maybeSingle();
    if (data) return data as ExistingOrganization;
  }

  const name = cleanString(candidate.name);
  if (!name) return null;

  const { data } = await supabase
    .from("organizations")
    .select(select)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  return (data as ExistingOrganization | null) ?? null;
}

async function upsertCuratedOrganization(
  supabase: SupabaseClient,
  candidate: CuratedOrganization,
): Promise<"inserted" | "updated" | "skipped" | "rejected"> {
  const name = cleanString(candidate.name);
  const sourceUrl = normalizeUrl(candidate.source_url);
  const websiteUrl = normalizeUrl(candidate.website_url);
  const category = normalizeOrganizationCategory(candidate.category);
  const locality = normalizeLocality(candidate.locality);
  const quality = evaluateOrganizationCandidate({
    name,
    description: candidate.description,
    category,
    website_url: websiteUrl,
    source_url: sourceUrl,
    locality,
  });
  if (!quality.accepted || !name || !sourceUrl) return "rejected";

  const slug = slugify(name);
  const status =
    normalizeConfidence(candidate.confidence) >= 0.75 ? "published" : "draft";
  const existing = await findExistingOrganization(supabase, {
    slug,
    sourceUrl,
    websiteUrl,
    name,
  });

  if (existing) {
    const { error } = await supabase
      .from("organizations")
      .update({
        description: existing.description ?? cleanString(candidate.description),
        description_en:
          existing.description_en ?? cleanString(candidate.description_en),
        website_url: existing.website_url ?? websiteUrl,
        email: existing.email ?? cleanString(candidate.email),
        phone: existing.phone ?? cleanString(candidate.phone),
        address: existing.address ?? cleanString(candidate.address),
        source_url: existing.source_url ?? sourceUrl,
        status: existing.status === "archived" ? "draft" : existing.status,
      })
      .eq("id", existing.id);
    if (error) {
      console.error("upsertCuratedOrganization update:", error.message);
      return "skipped";
    }
    return "updated";
  }

  const { error } = await supabase.from("organizations").insert({
    name,
    slug,
    description: cleanString(candidate.description),
    description_en: cleanString(candidate.description_en),
    category,
    website_url: websiteUrl,
    email: cleanString(candidate.email),
    phone: cleanString(candidate.phone),
    address: cleanString(candidate.address),
    locality,
    languages: normalizeLanguages(candidate.languages),
    source_url: sourceUrl,
    status,
    directory_source_url: null,
    directory_last_seen_at: new Date().toISOString(),
    directory_missing_since: null,
  });

  if (!error) return "inserted";
  if (error.code === "23505") return "skipped";
  console.error("upsertCuratedOrganization insert:", error.message);
  return "skipped";
}

async function resolveEventOrganizationId(
  supabase: SupabaseClient,
  candidate: CuratedEvent,
): Promise<string | null> {
  const organizationName = cleanString(candidate.organization_name);
  const organizationWebsiteUrl = normalizeUrl(
    candidate.organization_website_url,
  );
  const organizationSourceUrl = normalizeUrl(candidate.organization_source_url);
  const slug = organizationName ? slugify(organizationName) : null;
  const match = await findExistingOrganization(supabase, {
    slug,
    sourceUrl: organizationSourceUrl,
    websiteUrl: organizationWebsiteUrl,
    name: organizationName,
  });
  return match?.id ?? null;
}

async function upsertCuratedEvent(
  supabase: SupabaseClient,
  candidate: CuratedEvent,
): Promise<"imported" | "updated" | "skipped" | "rejected"> {
  const title = cleanString(candidate.title);
  const sourceUrl = normalizeUrl(candidate.source_url);
  const imageUrl = normalizeUrl(candidate.image_url);
  const startDate = normalizeIsoDate(candidate.start_date);
  const endDate = normalizeIsoDate(candidate.end_date);
  const category = normalizeEventCategory(candidate.category);
  const quality = shouldPublishEvent({
    title,
    description: candidate.description,
    category,
    start_date: startDate,
    end_date: endDate,
    location_name: candidate.location_name,
    address: candidate.address,
    source_url: sourceUrl,
    organizationName: candidate.organization_name,
  });
  if (!quality.accepted || !title || !sourceUrl || !startDate)
    return "rejected";

  const organizationId = await resolveEventOrganizationId(supabase, candidate);
  const payload = await withEventImageIfSupported(
    supabase,
    {
    organization_id: organizationId,
    title,
    description: cleanString(candidate.description),
    category,
    start_date: startDate,
    end_date: endDate,
    location_name: cleanString(candidate.location_name),
    address: cleanString(candidate.address),
    price: cleanString(candidate.price),
    language: normalizeEventLanguage(candidate.language),
    source_url: sourceUrl,
    is_recurring: false,
    is_recurring_template: false,
    status:
      normalizeConfidence(candidate.confidence) >= 0.65 ? "published" : "draft",
    },
    imageUrl,
  );

  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("source_url", sourceUrl)
    .eq("title", title)
    .eq("start_date", payload.start_date)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      console.error("upsertCuratedEvent update:", error.message);
      return "skipped";
    }
    return "updated";
  }

  const { data: duplicate } = await supabase
    .from("events")
    .select("id")
    .eq("title", title)
    .eq("start_date", payload.start_date)
    .limit(1)
    .maybeSingle();
  if (duplicate?.id) return "skipped";

  const slug = buildOccurrenceSlug(title, payload.start_date);
  const { error } = await supabase.from("events").insert({ ...payload, slug });
  if (!error) return "imported";
  if (error.code !== "23505") {
    console.error("upsertCuratedEvent insert:", error.message);
    return "skipped";
  }

  const { error: retryError } = await supabase
    .from("events")
    .insert({ ...payload, slug: `${slug}-${shortHash(sourceUrl)}` });
  if (!retryError) return "imported";
  if (retryError.code !== "23505") {
    console.error("upsertCuratedEvent retry:", retryError.message);
  }
  return "skipped";
}

export async function importCuratedScrapeResult(
  supabase: SupabaseClient,
  result: CuratedScrapeResult,
): Promise<CuratedImportResult> {
  const summary: CuratedImportResult = {
    organizations: { inserted: 0, updated: 0, skipped: 0, rejected: 0 },
    events: { imported: 0, updated: 0, skipped: 0, rejected: 0 },
    syncedAt: new Date().toISOString(),
  };

  for (const organization of result.organizations ?? []) {
    const action = await upsertCuratedOrganization(supabase, organization);
    summary.organizations[action]++;
  }

  for (const event of result.events ?? []) {
    const action = await upsertCuratedEvent(supabase, event);
    summary.events[action]++;
  }

  return summary;
}
