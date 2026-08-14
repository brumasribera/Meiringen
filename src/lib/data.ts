import { createClient, createServiceClient } from "@/lib/supabase/server";
import { agendaHorizonDate } from "@/lib/agenda/constants";
import { shouldPublishEvent } from "@/lib/curation/quality";
import { getStaticCuratedEvents } from "@/lib/curation/static-events";
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
  organizationSlug?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: "draft" | "published";
  limit?: number;
};

function shouldApplyPublicEventCuration(filters: EventFilters = {}) {
  return !filters.status || filters.status === "published";
}

function isPublicEvent(event: Event) {
  return shouldPublishEvent({
    title: event.title,
    description: event.description,
    category: event.category,
    start_date: event.start_date,
    end_date: event.end_date,
    location_name: event.location_name,
    address: event.address,
    source_url: event.source_url,
    organizationName: event.organization?.name,
  }).accepted;
}

function filterPublicEvents(events: Event[], limit?: number) {
  const filtered = events.filter(isPublicEvent);
  return limit ? filtered.slice(0, limit) : filtered;
}

function compareEventsByDate(left: Event, right: Event) {
  const dateDelta =
    new Date(left.start_date).getTime() - new Date(right.start_date).getTime();
  return dateDelta || left.title.localeCompare(right.title);
}

function eventIdentityKey(event: Event) {
  if (event.source_url) {
    return `${event.source_url}|${event.title}|${event.start_date}`;
  }

  return `${event.title}|${event.start_date}|${event.location_name ?? ""}`;
}

function mergeEvents(primaryEvents: Event[], fallbackEvents: Event[]) {
  const seen = new Set<string>();
  const merged: Event[] = [];

  for (const event of [...primaryEvents, ...fallbackEvents]) {
    const key = eventIdentityKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(event);
  }

  return merged.sort(compareEventsByDate);
}

function eventMatchesFilters(event: Event, filters: EventFilters) {
  if (filters.status && event.status !== filters.status) return false;
  if (!filters.status && event.status !== "published") return false;

  if (filters.categories && filters.categories.length > 0) {
    if (!filters.categories.includes(event.category)) return false;
  } else if (filters.category && event.category !== filters.category) {
    return false;
  }

  if (filters.language && event.language !== filters.language) return false;
  if (
    filters.organizationId &&
    event.organization_id !== filters.organizationId &&
    event.organization_slug !== filters.organizationSlug
  ) {
    return false;
  }

  if (
    filters.organizationSlug &&
    event.organization_slug &&
    event.organization_slug !== filters.organizationSlug
  ) {
    return false;
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    const haystack = [
      event.title,
      event.description,
      event.location_name,
      event.address,
      event.organization?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  const startTime = new Date(event.start_date).getTime();
  if (!Number.isFinite(startTime)) return false;

  if (filters.dateFrom) {
    if (startTime < new Date(filters.dateFrom).getTime()) return false;
  } else if (shouldApplyPublicEventCuration(filters) && startTime < Date.now()) {
    return false;
  }

  if (filters.dateTo) {
    if (startTime > new Date(filters.dateTo).getTime()) return false;
  } else if (
    shouldApplyPublicEventCuration(filters) &&
    startTime > agendaHorizonDate().getTime()
  ) {
    return false;
  }

  return true;
}

function getFilteredStaticEvents(filters: EventFilters = {}) {
  if (filters.status && filters.status !== "published") return [];

  return filterPublicEvents(
    getStaticCuratedEvents().filter((event) =>
      eventMatchesFilters(event, filters),
    ),
  );
}

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
  filters: OrganizationFilters = {},
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
  slug: string,
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

export async function getEvents(filters: EventFilters = {}): Promise<Event[]> {
  const staticEvents = shouldApplyPublicEventCuration(filters)
    ? getFilteredStaticEvents(filters)
    : [];
  const supabase = await createClient();
  if (!supabase) {
    return filters.limit ? staticEvents.slice(0, filters.limit) : staticEvents;
  }

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
    query = query.limit(
      shouldApplyPublicEventCuration(filters)
        ? filters.limit * 4
        : filters.limit,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("getEvents:", error.message);
    return [];
  }

  const events = (data ?? []) as Event[];
  if (shouldApplyPublicEventCuration(filters)) {
    const publicEvents = filterPublicEvents(events);
    const merged = mergeEvents(publicEvents, staticEvents);
    return filters.limit ? merged.slice(0, filters.limit) : merged;
  }

  return events;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const staticEvent =
    getStaticCuratedEvents().find((event) => event.slug === slug) ?? null;
  const supabase = await createClient();
  if (!supabase) {
    return staticEvent && isPublicEvent(staticEvent) ? staticEvent : null;
  }

  const { data, error } = await supabase
    .from("events")
    .select("*, organization:organizations(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    return staticEvent && isPublicEvent(staticEvent) ? staticEvent : null;
  }
  const event = data as Event;
  if (event.status === "published" && !isPublicEvent(event)) {
    return staticEvent && isPublicEvent(staticEvent) ? staticEvent : null;
  }
  return event;
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
  userId: string,
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
    supabase
      .from("scraping_sources")
      .select("id", { count: "exact", head: true }),
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
  userId?: string | null,
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
  userId?: string | null,
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
  limit = 3,
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

  let related = filterPublicEvents(
    ((categoryMatches ?? []) as Event[]).filter(isUpcomingEvent),
  );
  related = mergeEvents(
    related,
    getFilteredStaticEvents({
      category: event.category,
    }).filter((item) => item.id !== event.id),
  );

  if (related.length < limit && event.organization_id) {
    const { data: organizationMatches, error: organizationError } =
      await supabase
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
      console.error(
        "getRelatedEventsForEvent organization:",
        organizationError.message,
      );
    } else {
      related = dedupeById([
        ...related,
        ...filterPublicEvents(
          ((organizationMatches ?? []) as Event[]).filter(isUpcomingEvent),
        ),
      ]).sort(compareEventsByDate);
    }
  }

  return dedupeById(related).sort(compareEventsByDate).slice(0, limit);
}

export async function getAdjacentEventsForEvent(event: Event): Promise<{
  previous: Event | null;
  next: Event | null;
  previousEvents: Event[];
  nextEvents: Event[];
}> {
  const supabase = await createClient();
  if (!supabase) {
    const staticEvents = getFilteredStaticEvents();
    const index = staticEvents.findIndex((item) => item.id === event.id);
    const previousEvents =
      index > 0 ? staticEvents.slice(Math.max(0, index - 4), index) : [];
    const nextEvents = index >= 0 ? staticEvents.slice(index + 1, index + 5) : [];

    return {
      previous: index > 0 ? staticEvents[index - 1] : null,
      next:
        index >= 0 && index < staticEvents.length - 1
          ? staticEvents[index + 1]
          : null,
      previousEvents,
      nextEvents,
    };
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

  const events = mergeEvents(
    filterPublicEvents((data ?? []) as Event[]),
    getFilteredStaticEvents(),
  );
  const index = events.findIndex((item) => item.id === event.id);
  const previousEvents =
    index > 0 ? events.slice(Math.max(0, index - 4), index) : [];
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
  limit = 3,
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
    console.error(
      "getRelatedOrganizationsForOrganization category:",
      categoryError.message,
    );
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
      console.error(
        "getRelatedOrganizationsForOrganization locality:",
        localityError.message,
      );
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
  limit = 6,
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

  return ((data ?? []) as Array<{ event: Event | Event[] | null }>)
    .map((row) => firstRelated(row.event))
    .filter(
      (event): event is Event =>
        event !== null &&
        event.status === "published" &&
        !event.is_recurring_template &&
        isUpcomingEvent(event) &&
        isPublicEvent(event),
    )
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    )
    .slice(0, limit);
}

export async function getFollowedOrganizations(
  userId: string,
  limit = 6,
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
        organization !== null && organization.status === "published",
    )
    .slice(0, limit);
}
