import { parseGenericEvents } from "./generic-parser";
import type { ScrapedEvent } from "./generic-parser";

/**
 * Placeholder parser for meiringen.ch — implement site-specific HTML parsing here.
 * Expected: fetch listing page, parse event cards, return normalized events.
 */
export async function parseMeiringenCh(
  pageUrl: string,
  html: string
): Promise<ScrapedEvent[]> {
  // TODO: Add custom selectors for meiringen.ch event listings
  console.log(`[scraper] meiringen_ch placeholder for ${pageUrl} (${html.length} bytes)`);
  return [];
}

/**
 * Placeholder parser for haslital.ch — implement site-specific HTML parsing here.
 */
export async function parseHaslitalCh(
  pageUrl: string,
  html: string
): Promise<ScrapedEvent[]> {
  // TODO: Add custom selectors for haslital.ch event listings
  console.log(`[scraper] haslital_ch placeholder for ${pageUrl} (${html.length} bytes)`);
  return [];
}

export async function runParser(
  type: string,
  url: string,
  html: string
): Promise<ScrapedEvent[]> {
  switch (type) {
    case "meiringen_ch":
      return parseMeiringenCh(url, html);
    case "haslital_ch":
      return parseHaslitalCh(url, html);
    case "generic":
    default:
      return parseGenericEvents(url, html);
  }
}
