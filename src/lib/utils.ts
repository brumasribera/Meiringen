export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDateLocale(locale: string): string {
  switch (locale) {
    case "en":
      return "en-GB";
    case "gsw":
      return "de-CH";
    case "rm":
      return "rm-CH";
    case "de":
    case "fr":
    case "it":
    case "pt":
    case "es":
    case "ca":
      return locale;
    default:
      return "en-GB";
  }
}

export function formatDateRange(
  start: string,
  end: string | null,
  locale: string
): string {
  const startDate = new Date(start);
  const dateLocale = getDateLocale(locale);
  const timeZone = "Europe/Zurich";
  const dateFormatter = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  });
  const dateTimeFormatter = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
  const timeFormatter = new Intl.DateTimeFormat(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
  const isDateOnly = (value: Date) =>
    value.getHours() === 0 &&
    value.getMinutes() === 0 &&
    value.getSeconds() === 0 &&
    value.getMilliseconds() === 0;

  if (!end) {
    if (isDateOnly(startDate)) {
      return dateFormatter.format(startDate);
    }
    return dateTimeFormatter.format(startDate);
  }

  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const dateOnlyRange = isDateOnly(startDate) && isDateOnly(endDate);

  if (dateOnlyRange) {
    if (sameDay) {
      return dateFormatter.format(startDate);
    }

    return `${dateFormatter.format(startDate)} – ${dateFormatter.format(endDate)}`;
  }

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

type GoogleCalendarUrlOptions = {
  title: string;
  start: string;
  end?: string | null;
  description?: string | null;
  location?: string | null;
};

function toGoogleCalendarDate(value: Date): string {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildGoogleCalendarUrl({
  title,
  start,
  end,
  description,
  location,
}: GoogleCalendarUrlOptions): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGoogleCalendarDate(startDate)}/${toGoogleCalendarDate(endDate)}`,
    ctz: "Europe/Zurich",
  });

  if (description?.trim()) params.set("details", description.trim());
  if (location?.trim()) params.set("location", location.trim());

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
