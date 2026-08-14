import type { SupabaseClient } from "@supabase/supabase-js";

const BAD_IMAGE_URL_PATTERN =
  /(favicon|google\.com\/s2\/favicons|image-not-found|placeholder|\/icons?\/|\/logo)/i;

let eventImageColumnExistsPromise: Promise<boolean> | null = null;

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getAttribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"),
  );
  return match ? decodeHtmlAttribute(match[1]) : null;
}

function srcFromSrcset(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim().split(/\s+/)[0];
  return first || null;
}

export function normalizeImageUrl(
  value: string | null | undefined,
  baseUrl?: string,
): string | null {
  const cleaned = value?.trim();
  if (!cleaned) return null;

  try {
    const url =
      cleaned.startsWith("//") && !baseUrl
        ? new URL(`https:${cleaned}`)
        : new URL(decodeHtmlAttribute(cleaned), baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    const normalized = url.toString();
    if (BAD_IMAGE_URL_PATTERN.test(normalized)) return null;
    return normalized;
  } catch {
    return null;
  }
}

export function extractImageFromJsonLdValue(
  value: unknown,
  pageUrl: string,
): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return normalizeImageUrl(value, pageUrl);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const imageUrl = extractImageFromJsonLdValue(item, pageUrl);
      if (imageUrl) return imageUrl;
    }
    return null;
  }

  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return (
      extractImageFromJsonLdValue(item.url, pageUrl) ??
      extractImageFromJsonLdValue(item.contentUrl, pageUrl)
    );
  }

  return null;
}

export function extractEventImageUrlFromHtml(
  html: string,
  pageUrl: string,
): string | null {
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(
    (match) => match[0],
  );
  for (const tag of metaTags) {
    const key = (
      getAttribute(tag, "property") ??
      getAttribute(tag, "name") ??
      getAttribute(tag, "itemprop") ??
      ""
    ).toLowerCase();
    if (
      ![
        "og:image",
        "og:image:secure_url",
        "twitter:image",
        "twitter:image:src",
        "image",
      ].includes(key)
    ) {
      continue;
    }

    const imageUrl = normalizeImageUrl(getAttribute(tag, "content"), pageUrl);
    if (imageUrl) return imageUrl;
  }

  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map(
    (match) => match[0],
  );
  for (const tag of linkTags) {
    const rel = (getAttribute(tag, "rel") ?? "").toLowerCase();
    if (!rel.split(/\s+/).includes("image_src")) continue;
    const imageUrl = normalizeImageUrl(getAttribute(tag, "href"), pageUrl);
    if (imageUrl) return imageUrl;
  }

  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(jsonLdMatch[1].trim());
      const items = Array.isArray(json)
        ? json
        : Array.isArray(json["@graph"])
          ? json["@graph"]
          : [json];
      for (const item of items) {
        const imageUrl = extractImageFromJsonLdValue(item?.image, pageUrl);
        if (imageUrl) return imageUrl;
      }
    } catch {
      // Some sources ship malformed JSON-LD; image extraction should be best effort.
    }
  }

  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(
    (match) => match[0],
  );
  for (const tag of imageTags) {
    const rawSource = getAttribute(tag, "src") ?? srcFromSrcset(getAttribute(tag, "srcset"));
    const imageUrl = normalizeImageUrl(rawSource, pageUrl);
    if (imageUrl) return imageUrl;
  }

  return null;
}

export async function fetchEventImageUrl(
  sourceUrl: string,
  cache: Map<string, string | null>,
): Promise<string | null> {
  if (cache.has(sourceUrl)) return cache.get(sourceUrl) ?? null;

  try {
    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": "Meiringen.life Bot/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      cache.set(sourceUrl, null);
      return null;
    }

    const html = await response.text();
    const imageUrl = extractEventImageUrlFromHtml(html, sourceUrl);
    cache.set(sourceUrl, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error(`fetchEventImageUrl ${sourceUrl}:`, error);
    cache.set(sourceUrl, null);
    return null;
  }
}

export async function eventImageColumnExists(
  supabase: SupabaseClient,
): Promise<boolean> {
  eventImageColumnExistsPromise ??= (async () => {
    try {
      const { error } = await supabase.from("events").select("image_url").limit(1);
      return !error;
    } catch {
      return false;
    }
  })();

  return eventImageColumnExistsPromise;
}

export async function withEventImageIfSupported<
  T extends Record<string, unknown>,
>(
  supabase: SupabaseClient,
  payload: T,
  imageUrl: string | null | undefined,
): Promise<T & { image_url?: string }> {
  const normalized = normalizeImageUrl(imageUrl);
  if (!normalized) return payload;
  if (!(await eventImageColumnExists(supabase))) return payload;
  return { ...payload, image_url: normalized };
}
