import type { SupabaseClient } from "@supabase/supabase-js";
import { agendaHorizonDate } from "@/lib/agenda/constants";
import {
  eventCompletenessScore,
  eventIdentityKeys,
  findMatchingEventByIdentity,
  isRicherEvent,
  type EventIdentityCandidate,
} from "@/lib/event-dedupe";
import { eventImageColumnExists } from "@/lib/event-images";

export type EventUpsertPayload = {
  organization_id: string | null;
  title: string;
  description: string | null;
  category: string;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  address: string | null;
  price?: string | null;
  language?: string | null;
  source_url: string | null;
  image_url?: string | null;
  is_recurring: boolean;
  is_recurring_template: boolean;
  status: string;
};

export type ExistingEventForUpsert = EventUpsertPayload & {
  id: string;
  slug: string;
  created_at?: string | null;
  updated_at?: string | null;
};

const BASE_EVENT_SELECT = [
  "id",
  "slug",
  "organization_id",
  "title",
  "description",
  "category",
  "start_date",
  "end_date",
  "location_name",
  "address",
  "price",
  "language",
  "source_url",
  "is_recurring",
  "is_recurring_template",
  "status",
  "created_at",
  "updated_at",
].join(", ");

async function eventSelectFields(supabase: SupabaseClient) {
  return (await eventImageColumnExists(supabase))
    ? `${BASE_EVENT_SELECT}, image_url`
    : BASE_EVENT_SELECT;
}

function preferText(
  candidate: string | null | undefined,
  existing: string | null | undefined,
) {
  const candidateText = candidate?.trim() || null;
  const existingText = existing?.trim() || null;
  if (!candidateText) return existingText;
  if (!existingText) return candidateText;
  return candidateText.length >= existingText.length
    ? candidateText
    : existingText;
}

function preferValue<T>(
  candidate: T | null | undefined,
  existing: T | null | undefined,
) {
  return candidate ?? existing ?? null;
}

export function mergeEventUpsertPayload(
  existing: ExistingEventForUpsert,
  candidate: EventUpsertPayload,
): EventUpsertPayload {
  const candidateIsRicher = isRicherEvent(candidate, existing);

  const payload: EventUpsertPayload = {
    organization_id: preferValue(
      candidate.organization_id,
      existing.organization_id,
    ),
    title: candidateIsRicher ? candidate.title : existing.title,
    description: preferText(candidate.description, existing.description),
    category: candidateIsRicher ? candidate.category : existing.category,
    start_date: candidate.start_date,
    end_date: preferValue(candidate.end_date, existing.end_date),
    location_name: preferText(candidate.location_name, existing.location_name),
    address: preferText(candidate.address, existing.address),
    price: preferText(candidate.price, existing.price),
    language: preferValue(candidate.language, existing.language),
    source_url: candidateIsRicher
      ? preferValue(candidate.source_url, existing.source_url)
      : preferValue(existing.source_url, candidate.source_url),
    is_recurring: candidate.is_recurring,
    is_recurring_template: candidate.is_recurring_template,
    status:
      existing.status === "published" || candidate.status === "published"
        ? "published"
        : candidate.status,
  };

  if ("image_url" in candidate || "image_url" in existing) {
    payload.image_url = preferValue(candidate.image_url, existing.image_url);
  }

  return payload;
}

export async function findExistingEventForUpsert(
  supabase: SupabaseClient,
  candidate: EventUpsertPayload,
): Promise<ExistingEventForUpsert | null> {
  const { data, error } = await supabase
    .from("events")
    .select(await eventSelectFields(supabase))
    .eq("start_date", candidate.start_date)
    .limit(100);

  if (error) {
    console.error("findExistingEventForUpsert:", error.message);
    return null;
  }

  const rows = (data ?? []) as unknown as ExistingEventForUpsert[];
  const matches = rows.filter((event) =>
    findMatchingEventByIdentity(candidate, [event]),
  );
  if (matches.length === 0) return null;

  return matches.sort(
    (left, right) =>
      eventCompletenessScore(right) - eventCompletenessScore(left),
  )[0];
}

export function staticDuplicateIsRicher(
  candidate: EventIdentityCandidate,
  staticEvents: EventIdentityCandidate[],
) {
  const duplicate = findMatchingEventByIdentity(candidate, staticEvents);
  return Boolean(duplicate && !isRicherEvent(candidate, duplicate));
}

export async function cleanupDuplicatePublishedEvents(
  supabase: SupabaseClient,
  referenceEvents: EventIdentityCandidate[] = [],
) {
  const now = new Date();
  const horizon = agendaHorizonDate(now);
  const { data, error } = await supabase
    .from("events")
    .select(await eventSelectFields(supabase))
    .eq("status", "published")
    .eq("is_recurring_template", false)
    .gte("start_date", now.toISOString())
    .lte("start_date", horizon.toISOString())
    .order("start_date")
    .order("id")
    .limit(1500);

  if (error) {
    console.error("cleanupDuplicatePublishedEvents lookup:", error.message);
    return { reviewed: 0, drafted: 0 };
  }

  const keepers: ExistingEventForUpsert[] = [];
  const seen = new Map<string, number>();
  const draftIds = new Set<string>();

  const rows = (data ?? []) as unknown as ExistingEventForUpsert[];
  for (const row of rows) {
    const richerStaticDuplicate = referenceEvents.find(
      (reference) =>
        findMatchingEventByIdentity(row, [reference]) &&
        !isRicherEvent(row, reference),
    );
    if (richerStaticDuplicate) {
      draftIds.add(row.id);
      continue;
    }

    const keys = eventIdentityKeys(row);
    if (keys.length === 0) continue;

    let existingIndex: number | undefined;
    for (const key of keys) {
      const index = seen.get(key);
      if (index !== undefined) {
        existingIndex = index;
        break;
      }
    }

    if (existingIndex === undefined) {
      const index = keepers.length;
      keepers.push(row);
      for (const key of keys) {
        seen.set(key, index);
      }
      continue;
    }

    const existing = keepers[existingIndex];
    if (isRicherEvent(row, existing)) {
      draftIds.add(existing.id);
      keepers[existingIndex] = row;
      for (const key of keys) {
        seen.set(key, existingIndex);
      }
    } else {
      draftIds.add(row.id);
    }
  }

  const ids = Array.from(draftIds);
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100);
    const { error: draftError } = await supabase
      .from("events")
      .update({ status: "draft" })
      .in("id", batch);

    if (draftError) {
      console.error("cleanupDuplicatePublishedEvents draft:", draftError.message);
      return { reviewed: data?.length ?? 0, drafted: index };
    }
  }

  return { reviewed: data?.length ?? 0, drafted: ids.length };
}
