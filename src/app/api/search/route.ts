import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveOrgCoverImageUrl, resolveOrgImageUrl } from "@/lib/org-content";
import type { SearchResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  const supabase = await createServiceClient();
  const [orgsRes, eventsRes] = await Promise.all([
    supabase
      .from("organizations")
      .select(
        "id, slug, name, category, description, website_url, image_url, cover_image_url, locality"
      )
      .ilike("name", `%${q}%`)
      .limit(5),
    supabase
      .from("events")
      .select(
        "id, slug, title, category, organization:organizations(id, slug, name, category, website_url, image_url, cover_image_url, locality)"
      )
      .eq("status", "published")
      .ilike("title", `%${q}%`)
      .order("start_date")
      .limit(5),
  ]);

  const results: SearchResult[] = [];

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

  for (const event of eventsRes.data ?? []) {
    const organization = Array.isArray(event.organization)
      ? event.organization[0]
      : event.organization;
    results.push({
      type: "event",
      id: event.id,
      title: event.title,
      subtitle: organization?.name ?? null,
      href: `/events/${event.slug}`,
      image_url: organization
        ? resolveOrgCoverImageUrl(
            organization.cover_image_url,
            organization.image_url
          ) ??
          resolveOrgImageUrl(
            organization.image_url,
            organization.website_url,
            organization.locality
          )
        : null,
      category: event.category,
    });
  }

  return NextResponse.json({ results });
}
