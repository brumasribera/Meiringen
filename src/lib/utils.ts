export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDateRange(
  start: string,
  end: string | null,
  locale: string
): string {
  const startDate = new Date(start);
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!end) {
    return dateTimeFormatter.format(startDate);
  }

  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${dateTimeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`;
  }

  return `${dateTimeFormatter.format(startDate)} – ${dateTimeFormatter.format(endDate)}`;
}

type AlertHrefOptions = {
  category?: string | null;
  language?: string | null;
  organizationId?: string | null;
};

export function buildAlertHref({
  category,
  language,
  organizationId,
}: AlertHrefOptions = {}): string {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (language) {
    params.set("language", language);
  }

  if (organizationId) {
    params.set("organization", organizationId);
  }

  const query = params.toString();
  return query ? `/alerts?${query}` : "/alerts";
}

type GoogleMapsUrlOptions = {
  query?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function buildGoogleMapsUrl({
  query,
  latitude,
  longitude,
}: GoogleMapsUrlOptions): string | null {
  const value =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : query?.trim();

  if (!value) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}
