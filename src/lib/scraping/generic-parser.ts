import type { EventCategory } from "../constants";
import { isWithinAgendaHorizon } from "../agenda/constants";
import { cleanEventTitle } from "../event-title";

export type ScrapedEvent = {
  title: string;
  description: string | null;
  category: EventCategory;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  address: string | null;
  source_url: string;
  status: "draft";
};

/**
 * Generic parser: extracts schema.org Event data from JSON-LD blocks.
 * Many Swiss municipal and tourism sites publish events this way.
 */
export async function parseGenericEvents(
  pageUrl: string,
  html: string,
): Promise<ScrapedEvent[]> {
  const events = [
    ...parseJsonLdEvents(pageUrl, html),
    ...parseLinkedDatedEvents(pageUrl, html),
    ...parseTableDatedEvents(pageUrl, html),
  ];

  return dedupeEvents(events).filter((event) =>
    isWithinAgendaHorizon(event.start_date),
  );
}

function parseTableDatedEvents(pageUrl: string, html: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (cell) => cell[1],
    );
    if (cells.length < 3) continue;

    const dateText = stripTags(decodeHtml(cells[0])).trim();
    const timeText = stripTags(decodeHtml(cells[1] ?? "")).trim();
    const title = cleanEventTitle(stripTags(decodeHtml(cells[2])).trim());
    if (!title || title.length < 4) continue;

    const start = parseCompactDate(dateText, timeText);
    if (!start) continue;

    const rowLink = row[1].match(/<a\b[^>]*href=["']([^"']+)["']/i)?.[1];
    events.push({
      title,
      description: null,
      category: inferCategory(title, ""),
      start_date: start,
      end_date: parseEndDate(start, timeText),
      location_name: cells[3]
        ? stripTags(decodeHtml(cells[3])).trim() || null
        : null,
      address: null,
      source_url: rowLink
        ? (toAbsoluteUrl(rowLink, pageUrl) ?? pageUrl)
        : pageUrl,
      status: "draft",
    });
  }

  return events;
}

function parseJsonLdEvents(pageUrl: string, html: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      const items = Array.isArray(json)
        ? json
        : json["@graph"]
          ? json["@graph"]
          : [json];

      for (const item of items) {
        if (!isEventType(item)) continue;
        const parsed = mapJsonLdEvent(item, pageUrl);
        if (parsed) events.push(parsed);
      }
    } catch {
      // Skip malformed JSON-LD blocks
    }
  }

  return events;
}

function parseLinkedDatedEvents(pageUrl: string, html: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const sourceUrl = toAbsoluteUrl(match[1], pageUrl);
    if (!sourceUrl) continue;

    const title = cleanEventTitle(stripTags(decodeHtml(match[2])).trim());
    if (!title || title.length < 4) continue;

    const start = parseExplicitDate(title);
    if (!start) continue;

    events.push({
      title,
      description: null,
      category: inferCategory(title, ""),
      start_date: start,
      end_date: null,
      location_name: null,
      address: null,
      source_url: sourceUrl,
      status: "draft",
    });
  }

  return events;
}

function isEventType(item: Record<string, unknown>): boolean {
  const type = item["@type"];
  if (Array.isArray(type)) return type.includes("Event");
  return type === "Event";
}

function mapJsonLdEvent(
  item: Record<string, unknown>,
  pageUrl: string,
): ScrapedEvent | null {
  const title = cleanEventTitle(String(item.name ?? item.title ?? "").trim());
  const start = String(item.startDate ?? "");
  if (!title || !start) return null;

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return null;

  const end = item.endDate ? new Date(String(item.endDate)) : null;
  if (end && Number.isNaN(end.getTime())) return null;

  const location = item.location as Record<string, unknown> | undefined;
  const address = location?.address as
    Record<string, unknown> | string | undefined;

  let addressStr: string | null = null;
  if (typeof address === "string") addressStr = address;
  else if (address && typeof address === "object") {
    addressStr = [
      address.streetAddress,
      address.postalCode,
      address.addressLocality,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return {
    title,
    description: item.description ? String(item.description) : null,
    category: inferCategory(
      title,
      item.description ? String(item.description) : "",
    ),
    start_date: startDate.toISOString(),
    end_date: end ? end.toISOString() : null,
    location_name: location?.name ? String(location.name) : null,
    address: addressStr,
    source_url: toAbsoluteUrl(String(item.url ?? pageUrl), pageUrl) ?? pageUrl,
    status: "draft",
  };
}

const MONTHS: Record<string, number> = {
  januar: 1,
  janvier: 1,
  january: 1,
  febbraio: 2,
  februar: 2,
  fevrier: 2,
  février: 2,
  february: 2,
  marz: 3,
  maerz: 3,
  märz: 3,
  mars: 3,
  march: 3,
  marzo: 3,
  april: 4,
  avril: 4,
  aprile: 4,
  mai: 5,
  may: 5,
  maggio: 5,
  juni: 6,
  juin: 6,
  june: 6,
  giugno: 6,
  juli: 7,
  juillet: 7,
  july: 7,
  luglio: 7,
  august: 8,
  aout: 8,
  août: 8,
  agosto: 8,
  september: 9,
  septembre: 9,
  settembre: 9,
  oktober: 10,
  octobre: 10,
  october: 10,
  ottobre: 10,
  november: 11,
  novembre: 11,
  dezember: 12,
  decembre: 12,
  décembre: 12,
  december: 12,
  dicembre: 12,
};

function parseExplicitDate(text: string): string | null {
  const normalized = text.toLowerCase().normalize("NFKD");
  const namedRange = normalized.match(
    /\b(\d{1,2})\.?\s+([a-zà-ÿ]+)\s*[-–]\s*\d{1,2}\.?\s+[a-zà-ÿ]+\s+((?:20)\d{2})\b/,
  );
  const sameMonthRange = normalized.match(
    /\b(\d{1,2})\.\s*[-–]\s*\d{1,2}\.?\s+([a-zà-ÿ]+)\s+((?:20)\d{2})\b/,
  );
  const numeric = normalized.match(
    /\b(\d{1,2})[./-](\d{1,2})[./-]((?:20)\d{2})\b/,
  );
  const iso = normalized.match(/\b((?:20)\d{2})-(\d{1,2})-(\d{1,2})\b/);
  const named = normalized.match(
    /\b(\d{1,2})\.?\s+([a-zà-ÿ]+)\s+((?:20)\d{2})\b/,
  );
  const time =
    normalized.match(/\b(?:um\s*)?(\d{1,2}):(\d{2})(?:\s*uhr)?\b/) ??
    normalized.match(/\b(?:um\s*)?(\d{1,2})\.(\d{2})\s*uhr\b/);
  const hour = time ? Number(time[1]) : 12;
  const minute = time ? Number(time[2]) : 0;

  if (namedRange) {
    const month = MONTHS[namedRange[2]];
    if (month) {
      return buildUtcIso(
        Number(namedRange[3]),
        month,
        Number(namedRange[1]),
        hour,
        minute,
      );
    }
  }

  if (sameMonthRange) {
    const month = MONTHS[sameMonthRange[2]];
    if (month) {
      return buildUtcIso(
        Number(sameMonthRange[3]),
        month,
        Number(sameMonthRange[1]),
        hour,
        minute,
      );
    }
  }

  if (numeric) {
    return buildUtcIso(
      Number(numeric[3]),
      Number(numeric[2]),
      Number(numeric[1]),
      hour,
      minute,
    );
  }

  if (iso) {
    return buildUtcIso(
      Number(iso[1]),
      Number(iso[2]),
      Number(iso[3]),
      hour,
      minute,
    );
  }

  if (named) {
    const month = MONTHS[named[2]];
    if (month) {
      return buildUtcIso(
        Number(named[3]),
        month,
        Number(named[1]),
        hour,
        minute,
      );
    }
  }

  return null;
}

function parseCompactDate(dateText: string, timeText: string): string | null {
  const numeric = dateText
    .trim()
    .match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);
  if (!numeric) return null;

  const yearValue = Number(numeric[3]);
  const year = yearValue < 100 ? 2000 + yearValue : yearValue;
  const time = parseFirstTime(timeText);
  return buildUtcIso(
    year,
    Number(numeric[2]),
    Number(numeric[1]),
    time?.hour ?? 12,
    time?.minute ?? 0,
  );
}

function parseFirstTime(text: string): { hour: number; minute: number } | null {
  const match =
    text.match(/\b(\d{1,2}):(\d{2})\b/) ??
    text.match(/\b(\d{1,2})\.(\d{2})\s*uhr\b/i);
  if (!match) return null;
  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function parseEndDate(startIso: string, timeText: string): string | null {
  const range = timeText.match(
    /\b\d{1,2}[:.]\d{2}\s*[-–]\s*(\d{1,2})[:.](\d{2})\b/,
  );
  if (!range) return null;

  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setUTCHours(Number(range[1]), Number(range[2]), 0, 0);
  if (end <= start) return null;
  return end.toISOString();
}

function buildUtcIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string | null {
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

function toAbsoluteUrl(value: string, baseUrl: string): string | null {
  try {
    const url = new URL(decodeHtml(value), baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function dedupeEvents(events: ScrapedEvent[]): ScrapedEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = `${event.source_url}|${event.title}|${event.start_date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function inferCategory(
  title: string,
  description: string,
): EventCategory {
  const text = `${title} ${description}`.toLowerCase();
  if (/(kino\s*\+?|kino-meiringen|kinomeiringen|cinema)/.test(text)) {
    return "cinema";
  }
  if (
    /(ubersitz|altjahrswoche|trychel|trychler|brauch|brauchtum|warenmarkt)/.test(
      text,
    )
  ) {
    return "tradition";
  }
  if (/(markt|market|wochenmarkt)/.test(text)) return "market";
  if (
    /(turnier|sport|fussball|tennis|schwing|lauf|volleyball|curling)/.test(text)
  ) {
    return "sport";
  }
  if (/(konzert|musik|jodel|probe|chor)/.test(text)) return "music";
  if (/(wanderung|natur|berg|sac )/.test(text)) return "nature";
  if (/(fest|festival|festlich)/.test(text)) return "festival";
  if (/(kurs|schule|integration|sprach)/.test(text)) return "other";
  if (/(kino|theater|kultur)/.test(text)) return "culture";
  return "other";
}
