import { createClient, createServiceClient } from "@/lib/supabase/server";
import { agendaHorizonDate } from "@/lib/agenda/constants";
import type {
  ContentLanguage,
  EventCategory,
  Locality,
  OrganizationCategory,
  OrganizationStatus,
} from "./constants";
import type {
  Event,
  NewsletterPreferences,
  Organization,
  Profile,
} from "./types";

export type EventFilters = {
  search?: string;
  category?: EventCategory;
  categories?: EventCategory[];
  language?: ContentLanguage;
  organizationId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: "draft" | "published";
  limit?: number;
};

export type OrganizationFilters = {
  search?: string;
  category?: OrganizationCategory;
  categories?: OrganizationCategory[];
  locality?: Locality;
  status?: OrganizationStatus;
  includeHidden?: boolean;
  limit?: number;
};

export async function getOrganizations(
  filters: OrganizationFilters = {}
): Promise<Organization[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("organizations").select("*").order("name");

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else if (!filters.includeHidden) {
    query = query.eq("status", "published");
  }

  if (filters.categories && filters.categories.length > 0) {
    query = query.in("category", filters.categories);
  } else if (filters.category) {
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
    .eq("status", "published")
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

  if (filters.categories && filters.categories.length > 0) {
    query = query.in("category", filters.categories);
  } else if (filters.category) {
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

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return (data as Profile | null) ?? null;
}

export async function getNewsletterPreferences(
  userId: string
): Promise<NewsletterPreferences | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("newsletter_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  return (data as NewsletterPreferences | null) ?? null;
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

async function getOptionalServiceClient() {
  try {
    return await createServiceClient();
  } catch {
    return null;
  }
}

function isUpcomingEvent(event: Event) {
  return new Date(event.start_date).getTime() >= Date.now();
}

function dedupeById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function firstRelated<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getEventInterestSummary(
  eventId: string,
  userId?: string | null
) {
  let interestCount = 0;
  let isInterested = false;

  const serviceClient = await getOptionalServiceClient();
  if (serviceClient) {
    const { count, error } = await serviceClient
      .from("event_interests")
      .select("event_id", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (error) {
      console.error("getEventInterestSummary count:", error.message);
    } else {
      interestCount = count ?? 0;
    }
  }

  if (userId) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("event_interests")
        .select("event_id")
        .eq("user_id", userId)
        .eq("event_id", eventId)
        .limit(1);

      if (error) {
        console.error("getEventInterestSummary state:", error.message);
      } else {
        isInterested = (data?.length ?? 0) > 0;
      }
    }
  }

  return { interestCount, isInterested };
}

export async function getOrganizationFollowSummary(
  organizationId: string,
  userId?: string | null
) {
  let followerCount = 0;
  let isFollowing = false;

  const serviceClient = await getOptionalServiceClient();
  if (serviceClient) {
    const { count, error } = await serviceClient
      .from("organization_follows")
      .select("organization_id", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    if (error) {
      console.error("getOrganizationFollowSummary count:", error.message);
    } else {
      followerCount = count ?? 0;
    }
  }

  if (userId) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("organization_follows")
        .select("organization_id")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .limit(1);

      if (error) {
        console.error("getOrganizationFollowSummary state:", error.message);
      } else {
        isFollowing = (data?.length ?? 0) > 0;
      }
    }
  }

  return { followerCount, isFollowing };
}

export async function getRelatedEventsForEvent(
  event: Event,
  limit = 3
): Promise<Event[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const nowIso = new Date().toISOString();

  const { data: categoryMatches, error: categoryError } = await supabase
    .from("events")
    .select("*, organization:organizations(*)")
    .eq("status", "published")
    .eq("is_recurring_template", false)
    .eq("category", event.category)
    .neq("id", event.id)
    .gte("start_date", nowIso)
    .order("start_date")
    .limit(limit * 2);

  if (categoryError) {
    console.error("getRelatedEventsForEvent category:", categoryError.message);
  }

  let related = ((categoryMatches ?? []) as Event[]).filter(isUpcomingEvent);

  if (related.length < limit && event.organization_id) {
    const { data: organizationMatches, error: organizationError } = await supabase
      .from("events")
      .select("*, organization:organizations(*)")
      .eq("status", "published")
      .eq("is_recurring_template", false)
      .eq("organization_id", event.organization_id)
      .neq("id", event.id)
      .gte("start_date", nowIso)
      .order("start_date")
      .limit(limit * 2);

    if (organizationError) {
      console.error("getRelatedEventsForEvent organization:", organizationError.message);
    } else {
      related = dedupeById([
        ...related,
        ...((organizationMatches ?? []) as Event[]).filter(isUpcomingEvent),
      ]);
    }
  }

  return dedupeById(related).slice(0, limit);
}

export async function getAdjacentEventsForEvent(event: Event): Promise<{
  previous: Event | null;
  next: Event | null;
  previousEvents: Event[];
  nextEvents: Event[];
}> {
  const supabase = await createClient();
  if (!supabase) {
    return { previous: null, next: null, previousEvents: [], nextEvents: [] };
  }

  const { data, error } = await supabase
    .from("events")
    .select("*, organization:organizations(*)")
    .eq("status", "published")
    .eq("is_recurring_template", false)
    .order("start_date")
    .order("id");

  if (error) {
    console.error("getAdjacentEventsForEvent:", error.message);
    return { previous: null, next: null, previousEvents: [], nextEvents: [] };
  }

  const events = (data ?? []) as Event[];
  const index = events.findIndex((item) => item.id === event.id);
  const previousEvents = index > 0 ? events.slice(Math.max(0, index - 4), index) : [];
  const nextEvents = index >= 0 ? events.slice(index + 1, index + 5) : [];

  return {
    previous: index > 0 ? events[index - 1] : null,
    next: index >= 0 && index < events.length - 1 ? events[index + 1] : null,
    previousEvents,
    nextEvents,
  };
}

export async function getRelatedOrganizationsForOrganization(
  organization: Organization,
  limit = 3
): Promise<Organization[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: categoryMatches, error: categoryError } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "published")
    .eq("category", organization.category)
    .neq("id", organization.id)
    .order("name")
    .limit(limit * 2);

  if (categoryError) {
    console.error("getRelatedOrganizationsForOrganization category:", categoryError.message);
  }

  let related = (categoryMatches ?? []) as Organization[];

  if (related.length < limit && organization.locality) {
    const { data: localityMatches, error: localityError } = await supabase
      .from("organizations")
      .select("*")
      .eq("status", "published")
      .eq("locality", organization.locality)
      .neq("id", organization.id)
      .order("name")
      .limit(limit * 2);

    if (localityError) {
      console.error("getRelatedOrganizationsForOrganization locality:", localityError.message);
    } else {
      related = dedupeById([
        ...related,
        ...((localityMatches ?? []) as Organization[]),
      ]);
    }
  }

  return dedupeById(related).slice(0, limit);
}

export async function getInterestedEvents(
  userId: string,
  limit = 6
): Promise<Event[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("event_interests")
    .select("created_at, event:events(*, organization:organizations(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getInterestedEvents:", error.message);
    return [];
  }

  return (
    (data ?? []) as Array<{ event: Event | Event[] | null }>
  )
    .map((row) => firstRelated(row.event))
    .filter(
      (event): event is Event =>
        event !== null &&
        event.status === "published" &&
        !event.is_recurring_template &&
        isUpcomingEvent(event)
    )
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, limit);
}

export async function getFollowedOrganizations(
  userId: string,
  limit = 6
): Promise<Organization[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("organization_follows")
    .select("created_at, organization:organizations(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getFollowedOrganizations:", error.message);
    return [];
  }

  return (
    (data ?? []) as Array<{
      organization: Organization | Organization[] | null;
    }>
  )
    .map((row) => firstRelated(row.organization))
    .filter(
      (organization): organization is Organization =>
        organization !== null && organization.status === "published"
    )
    .slice(0, limit);
}
