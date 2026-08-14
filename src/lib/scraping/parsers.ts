import { parseGenericEvents } from "./generic-parser";
import { inferCategory, type ScrapedEvent } from "./generic-parser";

/**
 * Site-specific parser for the i-web event table embedded by meiringen.ch.
 */
export async function parseMeiringenCh(
  pageUrl: string,
  html: string,
): Promise<ScrapedEvent[]> {
  const decodedHtml = decodeHtml(decodeHtml(html))
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"');
  const events: ScrapedEvent[] = [];
  const rowStarts = [...decodedHtml.matchAll(/{"id":"\d+"/g)].map(
    (match) => match.index ?? 0,
  );

  for (let index = 0; index < rowStarts.length; index++) {
    const chunk = decodedHtml.slice(rowStarts[index], rowStarts[index + 1]);
    const nameHtml = getEmbeddedField(chunk, "name", ["name-sort"]);
    const linkMatch = nameHtml.match(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const title = stripTags(linkMatch?.[2] ?? nameHtml);
    const start = new Date(
      Number(
        getEmbeddedField(chunk, "datumVon", ["datumVon-sort", "datumBis"]),
      ),
    );
    const end = new Date(
      Number(
        getEmbeddedField(chunk, "datumBis", ["datumBis-sort", "organisator"]),
      ),
    );
    if (!title || Number.isNaN(start.getTime())) continue;

    const organizer = stripTags(
      getEmbeddedField(chunk, "organisator", [
        "organisator-sort",
        "hauptkategorieId",
      ]),
    );
    const location = stripTags(
      getEmbeddedField(chunk, "lokalitaet", ["lokalitaet-sort", "datumVon"]),
    );
    const sourceUrl = linkMatch?.[1]
      ? (absoluteUrl(linkMatch[1], pageUrl) ?? pageUrl)
      : pageUrl;

    events.push({
      title,
      description: organizer ? `Organisator: ${organizer}` : null,
      category: inferCategory(title, organizer),
      start_date: start.toISOString(),
      end_date:
        !Number.isNaN(end.getTime()) && end.getTime() !== start.getTime()
          ? end.toISOString()
          : null,
      location_name: location || null,
      address:
        stripTags(getEmbeddedField(chunk, "ort", ["ort-sort", "lokalitaet"])) ||
        null,
      source_url: sourceUrl,
      status: "draft",
    });
  }

  return dedupeEvents(events);
}

/**
 * Placeholder parser for haslital.ch — implement site-specific HTML parsing here.
 */
export async function parseHaslitalCh(
  pageUrl: string,
  html: string,
): Promise<ScrapedEvent[]> {
  // TODO: Add custom selectors for haslital.ch event listings
  console.log(
    `[scraper] haslital_ch placeholder for ${pageUrl} (${html.length} bytes)`,
  );
  return [];
}

function absoluteUrl(value: string, baseUrl: string): string | null {
  try {
    const url = new URL(decodeHtml(value), baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function getEmbeddedField(
  chunk: string,
  field: string,
  nextFields: string[],
): string {
  const marker = `"${field}":"`;
  const start = chunk.indexOf(marker);
  if (start === -1) return "";
  const valueStart = start + marker.length;
  const end = nextFields
    .map((nextField) => chunk.indexOf(`","${nextField}":`, valueStart))
    .filter((index) => index !== -1)
    .sort((left, right) => left - right)[0];
  return chunk.slice(valueStart, end ?? chunk.length);
}

function stripTags(value: string): string {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

export async function runParser(
  type: string,
  url: string,
  html: string,
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
