import { slugify } from "@/lib/utils";
import type { EventCategory } from "@/lib/constants";
import { isWithinAgendaHorizon } from "@/lib/agenda/constants";

export type ScrapedEvent = {
  title: string;
  slug: string;
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
  html: string
): Promise<ScrapedEvent[]> {
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
        if (parsed && isWithinAgendaHorizon(parsed.start_date)) {
          events.push(parsed);
        }
      }
    } catch {
      // Skip malformed JSON-LD blocks
    }
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
  pageUrl: string
): ScrapedEvent | null {
  const title = String(item.name ?? item.title ?? "").trim();
  const start = String(item.startDate ?? "");
  if (!title || !start) return null;

  const location = item.location as Record<string, unknown> | undefined;
  const address = location?.address as Record<string, unknown> | string | undefined;

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
    slug: slugify(title),
    description: item.description ? String(item.description) : null,
    category: inferCategory(title, item.description ? String(item.description) : ""),
    start_date: new Date(start).toISOString(),
    end_date: item.endDate ? new Date(String(item.endDate)).toISOString() : null,
    location_name: location?.name ? String(location.name) : null,
    address: addressStr,
    source_url: String(item.url ?? pageUrl),
    status: "draft",
  };
}

function inferCategory(title: string, description: string): EventCategory {
  const text = `${title} ${description}`.toLowerCase();
  if (/(ubersitz|altjahrswoche|trychel|trychler|brauch|brauchtum|warenmarkt)/.test(text)) {
    return "tradition";
  }
  if (/(markt|market|wochenmarkt)/.test(text)) return "market";
  if (/(turnier|sport|fussball|tennis|schwing|lauf|volleyball|curling)/.test(text)) {
    return "sport";
  }
  if (/(konzert|musik|jodel|probe|chor)/.test(text)) return "music";
  if (/(wanderung|natur|berg|sac )/.test(text)) return "nature";
  if (/(fest|festival|festlich)/.test(text)) return "festival";
  if (/(kurs|schule|integration|sprach)/.test(text)) return "integration";
  if (/(kino|theater|kultur)/.test(text)) return "culture";
  return "other";
}
