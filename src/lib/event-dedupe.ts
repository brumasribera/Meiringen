export type EventIdentityCandidate = {
  title: string;
  start_date: string;
  end_date?: string | null;
  location_name?: string | null;
  address?: string | null;
  description?: string | null;
  price?: string | null;
  language?: string | null;
  source_url?: string | null;
  image_url?: string | null;
  organization_id?: string | null;
  organization_slug?: string | null;
  organization?: { name?: string | null } | null;
};

export function normalizeEventIdentityText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, "and")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

export function canonicalSourceUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim().replace(/\/$/, "") || null;
  }
}

export function eventStartIdentity(event: EventIdentityCandidate) {
  const timestamp = new Date(event.start_date).getTime();
  return Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : event.start_date;
}

export function eventIdentityKeys(event: EventIdentityCandidate) {
  const start = eventStartIdentity(event);
  const title = normalizeEventIdentityText(event.title);
  if (!title || !start) return [];

  const location = normalizeEventIdentityText(
    event.location_name ?? event.address,
  );
  const source = canonicalSourceUrl(event.source_url);

  return [
    source ? `source-title|${source}|${start}|${title}` : null,
    location ? `title-location|${title}|${start}|${location}` : null,
    `title|${title}|${start}`,
  ].filter((key): key is string => Boolean(key));
}

export function compareEventsByDate<T extends EventIdentityCandidate>(
  left: T,
  right: T,
) {
  const dateDelta =
    new Date(left.start_date).getTime() - new Date(right.start_date).getTime();
  return dateDelta || left.title.localeCompare(right.title);
}

export function eventCompletenessScore(event: EventIdentityCandidate) {
  const descriptionLength = event.description?.trim().length ?? 0;

  return [
    event.image_url ? 80 : 0,
    event.source_url ? 16 : 0,
    Math.min(24, Math.floor(descriptionLength / 24)),
    event.location_name || event.address ? 12 : 0,
    event.end_date ? 6 : 0,
    event.organization_id || event.organization_slug || event.organization
      ? 6
      : 0,
    event.price ? 4 : 0,
    event.language ? 2 : 0,
  ].reduce((total, value) => total + value, 0);
}

export function isRicherEvent(
  candidate: EventIdentityCandidate,
  existing: EventIdentityCandidate,
) {
  return eventCompletenessScore(candidate) > eventCompletenessScore(existing);
}

export function eventsShareIdentity(
  left: EventIdentityCandidate,
  right: EventIdentityCandidate,
) {
  const leftKeys = new Set(eventIdentityKeys(left));
  return eventIdentityKeys(right).some((key) => leftKeys.has(key));
}

export function findMatchingEventByIdentity<T extends EventIdentityCandidate>(
  event: EventIdentityCandidate,
  candidates: T[],
) {
  return (
    candidates.find((candidate) => eventsShareIdentity(candidate, event)) ??
    null
  );
}

export function mergeEventsByIdentity<T extends EventIdentityCandidate>(
  ...eventLists: T[][]
) {
  const seen = new Map<string, number>();
  const merged: T[] = [];

  for (const event of eventLists.flat()) {
    const keys = eventIdentityKeys(event);
    if (keys.length === 0) continue;

    let existingIndex: number | undefined;
    for (const key of keys) {
      const index = seen.get(key);
      if (index !== undefined) {
        existingIndex = index;
        break;
      }
    }

    if (existingIndex !== undefined) {
      const existing = merged[existingIndex];
      if (isRicherEvent(event, existing)) {
        merged[existingIndex] = event;
        for (const key of keys) {
          seen.set(key, existingIndex);
        }
      }
      continue;
    }

    const index = merged.length;
    for (const key of keys) {
      seen.set(key, index);
    }
    merged.push(event);
  }

  return merged.sort(compareEventsByDate);
}
