import { NextResponse } from "next/server";
import { agendaHorizonDate } from "@/lib/agenda/constants";
import { createServiceClient } from "@/lib/supabase/server";
import { shouldPublishEvent } from "@/lib/curation/quality";
import { getStaticCuratedEvents } from "@/lib/curation/static-events";
import {
  eventCompletenessScore,
  eventIdentityKeys,
  normalizeEventIdentityText,
} from "@/lib/event-dedupe";
import { resolveOrgCoverImageUrl, resolveOrgImageUrl } from "@/lib/org-content";
import type { SearchResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchEventRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: SearchResult["category"];
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  address: string | null;
  source_url: string | null;
  image_url?: string | null;
  organization:
    | {
        id: string;
        slug: string;
        name: string;
        category: string;
        website_url: string | null;
        image_url: string | null;
        cover_image_url: string | null;
        locality: string | null;
      }
    | Array<{
        id: string;
        slug: string;
        name: string;
        category: string;
        website_url: string | null;
        image_url: string | null;
        cover_image_url: string | null;
        locality: string | null;
      }>
    | null;
};

function matchesSearchQuery(
  q: string,
  values: Array<string | null | undefined>,
) {
  if (!q) return true;
  const query = q.toLowerCase();
  return values.filter(Boolean).join(" ").toLowerCase().includes(query);
}

function dedupeResults(results: SearchResult[]) {
  const seen = new Map<string, number>();
  const deduped: SearchResult[] = [];

  for (const result of results) {
    const keys =
      result.type === "event" && result.start_date
        ? eventIdentityKeys({
            title: result.title,
            start_date: result.start_date,
            location_name: result.location_name,
            source_url: result.source_url,
            image_url: result.image_url,
          }).map((key) => `${result.type}|${key}`)
        : [
            result.type === "event"
              ? `${result.type}|${normalizeEventIdentityText(result.title)}`
              : `${result.type}|${result.href}`,
          ];

    let existingIndex: number | undefined;
    for (const key of keys) {
      const index = seen.get(key);
      if (index !== undefined) {
        existingIndex = index;
        break;
      }
    }

    if (existingIndex === undefined) {
      for (const key of keys) {
        seen.set(key, deduped.length);
      }
      deduped.push(result);
      continue;
    }

    const existing = deduped[existingIndex];
    if (
      eventCompletenessScore({
        title: result.title,
        start_date: result.start_date ?? "",
        location_name: result.location_name,
        source_url: result.source_url,
        image_url: result.image_url,
      }) >
      eventCompletenessScore({
        title: existing.title,
        start_date: existing.start_date ?? "",
        location_name: existing.location_name,
        source_url: existing.source_url,
        image_url: existing.image_url,
      })
    ) {
      deduped[existingIndex] = result;
      for (const key of keys) {
        seen.set(key, existingIndex);
      }
    }
  }

  return deduped;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const nowIso = new Date().toISOString();
  const horizonIso = agendaHorizonDate().toISOString();
  const results: SearchResult[] = [];

  try {
    const supabase = await createServiceClient();
    const [orgsRes, eventsRes] = await Promise.all([
      q
        ? supabase
            .from("organizations")
            .select(
              "id, slug, name, category, description, website_url, image_url, cover_image_url, locality",
            )
            .eq("status", "published")
            .or(`name.ilike.%${q}%,locality.ilike.%${q}%`)
            .order("name")
            .limit(8)
        : supabase
            .from("organizations")
            .select(
              "id, slug, name, category, description, website_url, image_url, cover_image_url, locality",
            )
            .eq("status", "published")
            .order("name")
            .limit(12),
      q
        ? supabase
            .from("events")
            .select(
              "*, organization:organizations(id, slug, name, category, website_url, image_url, cover_image_url, locality)",
            )
            .eq("status", "published")
            .eq("is_recurring_template", false)
            .or(`title.ilike.%${q}%`)
            .gte("start_date", nowIso)
            .lte("start_date", horizonIso)
            .order("start_date")
            .limit(32)
        : supabase
            .from("events")
            .select(
              "*, organization:organizations(id, slug, name, category, website_url, image_url, cover_image_url, locality)",
            )
            .eq("status", "published")
            .eq("is_recurring_template", false)
            .gte("start_date", nowIso)
            .lte("start_date", horizonIso)
            .order("start_date")
            .limit(48),
    ]);

    for (const org of orgsRes.data ?? []) {
      results.push({
        type: "organization",
        id: org.id,
        title: org.name,
        subtitle: org.description ?? null,
        href: `/organizations/${org.slug}`,
        image_url:
          resolveOrgCoverImageUrl(org.cover_image_url, org.image_url) ??
          resolveOrgImageUrl(org.image_url, org.website_url, org.locality),
        category: org.category,
      });
    }

    const publicEvents = ((eventsRes.data ?? []) as SearchEventRow[]).filter(
      (event) => {
        const organization = Array.isArray(event.organization)
          ? event.organization[0]
          : event.organization;
        return shouldPublishEvent({
          title: event.title,
          description: event.description,
          category: event.category,
          start_date: event.start_date,
          end_date: event.end_date,
          location_name: event.location_name,
          address: event.address,
          source_url: event.source_url,
          organizationName: organization?.name,
        }).accepted;
      },
    );

    for (const event of publicEvents.slice(0, q ? 8 : 12)) {
      const organization = Array.isArray(event.organization)
        ? event.organization[0]
        : event.organization;
      results.push({
        type: "event",
        id: event.id,
        title: event.title,
        subtitle: organization?.name ?? null,
        href: `/events/${event.slug}`,
        image_url:
          event.image_url ??
          (organization
            ? (resolveOrgCoverImageUrl(
                organization.cover_image_url,
                organization.image_url,
              ) ??
              resolveOrgImageUrl(
                organization.image_url,
                organization.website_url,
                organization.locality,
              ))
            : null),
        category: event.category,
        start_date: event.start_date,
        location_name: event.location_name,
        source_url: event.source_url,
      });
    }
  } catch (error) {
    console.error("search service client:", error);
  }

  const staticEvents = getStaticCuratedEvents()
    .filter((event) => {
      if (new Date(event.start_date).getTime() < Date.now()) return false;
      if (new Date(event.start_date).getTime() > new Date(horizonIso).getTime()) {
        return false;
      }
      if (
        !matchesSearchQuery(q, [
          event.title,
          event.description,
          event.location_name,
          event.address,
        ])
      ) {
        return false;
      }
      return shouldPublishEvent({
        title: event.title,
        description: event.description,
        category: event.category,
        start_date: event.start_date,
        end_date: event.end_date,
        location_name: event.location_name,
        address: event.address,
        source_url: event.source_url,
      }).accepted;
    })
    .sort(
      (left, right) =>
        new Date(left.start_date).getTime() -
        new Date(right.start_date).getTime(),
    )
    .slice(0, q ? 8 : 12);

  for (const event of staticEvents) {
    results.push({
      type: "event",
      id: event.id,
      title: event.title,
      subtitle: event.location_name,
      href: `/events/${event.slug}`,
      image_url: event.image_url,
      category: event.category,
      start_date: event.start_date,
      location_name: event.location_name,
      source_url: event.source_url,
    });
  }

  return NextResponse.json({ results: dedupeResults(results) });
}
