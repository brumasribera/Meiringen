import { createClient } from "@/lib/supabase/server";
import { agendaHorizonDate } from "@/lib/agenda/constants";
import type { Category, ContentLanguage, Locality } from "./constants";
import type { Event, Organization } from "./types";

export type EventFilters = {
  search?: string;
  category?: Category;
  language?: ContentLanguage;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: "draft" | "published";
  limit?: number;
};

export type OrganizationFilters = {
  search?: string;
  category?: Category;
  locality?: Locality;
  limit?: number;
};

export async function getOrganizations(
  filters: OrganizationFilters = {}
): Promise<Organization[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("organizations").select("*").order("name");

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.locality) {
    query = query.eq("locality", filters.locality);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getOrganizations:", error.message);
    return [];
  }

  return (data ?? []) as Organization[];
}

export async function getOrganizationBySlug(
  slug: string
): Promise<Organization | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Organization;
}

export async function getEvents(
  filters: EventFilters = {}
): Promise<Event[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("events")
    .select("*, organization:organizations(*)")
    .eq("is_recurring_template", false)
    .order("start_date");

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else {
    query = query.eq("status", "published");
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.language) {
    query = query.eq("language", filters.language);
  }

  if (filters.organizationId) {
    query = query.eq("organization_id", filters.organizationId);
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  if (filters.dateFrom) {
    query = query.gte("start_date", filters.dateFrom);
  } else if (!filters.status || filters.status === "published") {
    query = query.gte("start_date", new Date().toISOString());
  }

  if (filters.dateTo) {
    query = query.lte("start_date", filters.dateTo);
  } else if (!filters.status || filters.status === "published") {
    query = query.lte("start_date", agendaHorizonDate().toISOString());
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getEvents:", error.message);
    return [];
  }

  return (data ?? []) as Event[];
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select("*, organization:organizations(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Event;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function getNewsletterPreferences(userId: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("newsletter_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function getAdminStats() {
  const supabase = await createClient();
  if (!supabase) {
    return { organizations: 0, events: 0, drafts: 0, sources: 0 };
  }

  const [orgs, events, drafts, sources] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase.from("scraping_sources").select("id", { count: "exact", head: true }),
  ]);

  return {
    organizations: orgs.count ?? 0,
    events: events.count ?? 0,
    drafts: drafts.count ?? 0,
    sources: sources.count ?? 0,
  };
}
