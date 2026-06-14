import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outputPath = path.join(
  root,
  "supabase",
  "migrations",
  "0015_smart_organization_cover_images.sql"
);

const USER_AGENT =
  "Mozilla/5.0 (compatible; MeiringenCoverDiscovery/1.0; +https://meiringen.life)";
const MAX_VALIDATION_ATTEMPTS = 8;
const MIN_SCORE = 70;
const CONCURRENCY = 4;

const TRUSTED_EXTERNAL_IMAGE_HOSTS = new Set([
  "static.wixstatic.com",
  "image.jimcdn.com",
  "i0.wp.com",
  "i1.wp.com",
  "i2.wp.com",
  "i.wp.com",
  "dam.destination.one",
  "proxy.fairgate.ch",
]);

const MANUAL_COVER_OVERRIDES = new Map([
  [
    "kino-meiringen",
    "https://static.wixstatic.com/media/11062b_19297116e92043588104e344620590ca~mv2.jpg",
  ],
  [
    "karate-kickboxing-meiringen",
    "https://www.karate-kickboxing.ch/images/content/eyecatcher/default/99team_wmac.jpg",
  ],
  [
    "nordischer-skiclub-oberhasli",
    "https://nscoberhasli.ch/wp-content/uploads/2025/01/img_4953.jpg",
  ],
  [
    "pfadfinder-meiringen-brienz",
    "https://www.pfadimeiringenbrienz.ch/theme/stchrist/images/11.jpg",
  ],
  [
    "turnverein-meiringen",
    "https://static.wixstatic.com/media/a63353_c8bebf1a16de4494b0b0e2cec5a734e5~mv2.jpeg",
  ],
]);

const GENERIC_EXACT_URLS = new Set([
  "https://www.haslital-brienz.ch/vereine",
  "https://haslital-brienz.ch/vereine",
  "https://www.brienzwiler.ch/freizeit/vereine-im-dorf",
  "https://brienzwiler.ch/freizeit/vereine-im-dorf",
]);

const GENERIC_ROOT_HOSTS = new Set([
  "brienz.ch",
  "gadmen.ch",
  "guttannen.ch",
  "haslital-brienz.ch",
  "innertkirchen.ch",
  "meiringen.ch",
]);

const HERO_TOKENS = [
  ["header-image", 120],
  ["hero", 100],
  ["banner", 90],
  ["masthead", 80],
  ["slider", 70],
  ["slideshow", 70],
  ["cover", 60],
  ["featured", 60],
  ["panoramic", 50],
  ["titlebar", 50],
  ["site-header", 40],
  ["header", 35],
];

const BAD_TOKENS = [
  "logo",
  "custom-logo",
  "mobile-logo",
  "favicon",
  "apple-touch",
  "icon",
  "avatar",
  "footer",
  "widget",
  "twint",
  "qr",
  "button",
  "badge",
  "sponsor",
  "placehold",
  "placeholder",
  "backgroundwhite",
  "blur_",
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[line.slice(0, idx).trim()] = value;
  }
  return env;
}

function htmlDecode(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();

    if (normalized === "amp" || normalized === "#038") return "&";
    if (normalized === "quot") return '"';
    if (normalized === "apos" || normalized === "#039") return "'";
    if (normalized === "lt") return "<";
    if (normalized === "gt") return ">";
    if (normalized === "nbsp") return " ";

    if (normalized.startsWith("#x")) {
      const codePoint = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    if (normalized.startsWith("#")) {
      const codePoint = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    return match;
  });
}

function parseAttributes(tag) {
  const attrs = {};
  const pattern =
    /([:@A-Za-z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

  for (const match of tag.matchAll(pattern)) {
    attrs[match[1].toLowerCase()] = htmlDecode(
      match[2] ?? match[3] ?? match[4] ?? ""
    );
  }

  return attrs;
}

function absolutize(baseUrl, value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return null;
  }

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

function normalizeWebsite(urlString) {
  try {
    const url = new URL(urlString);
    const normalized = new URL(url.toString());
    normalized.hash = "";
    if (normalized.pathname !== "/" && normalized.pathname.endsWith("/")) {
      normalized.pathname = normalized.pathname.slice(0, -1);
    }
    return normalized.toString();
  } catch {
    return urlString;
  }
}

function isGenericWebsite(urlString) {
  try {
    const normalized = normalizeWebsite(urlString);
    if (GENERIC_EXACT_URLS.has(normalized)) return true;

    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, "");
    const pathName = url.pathname.replace(/\/+$/, "") || "/";
    return GENERIC_ROOT_HOSTS.has(host) && pathName === "/";
  } catch {
    return true;
  }
}

function parseSrcsetCandidate(srcset, baseUrl) {
  const entries = srcset
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split(/\s+/);
      const descriptor = parts[parts.length - 1] ?? "";
      const widthMatch = descriptor.match(/^(\d+)w$/i);
      const densityMatch = descriptor.match(/^(\d+(?:\.\d+)?)x$/i);
      const width =
        Number(widthMatch?.[1] ?? 0) || Number(densityMatch?.[1] ?? 0) * 1000;
      const value = parts.slice(0, Math.max(parts.length - 1, 1)).join(" ");
      return {
        url: absolutize(baseUrl, value),
        width,
      };
    })
    .filter((entry) => entry.url);

  if (!entries.length) return null;
  entries.sort((a, b) => b.width - a.width);
  return entries[0].url;
}

function inferDimensionsFromUrl(urlString) {
  const url = urlString.toLowerCase();
  const wixMatch = url.match(/\/w_(\d+),h_(\d+)[,/]/);
  if (wixMatch) {
    return {
      width: Number(wixMatch[1]),
      height: Number(wixMatch[2]),
    };
  }

  const queryMatch = url.match(/[?&]width=(\d+).*?[?&]height=(\d+)/);
  if (queryMatch) {
    return {
      width: Number(queryMatch[1]),
      height: Number(queryMatch[2]),
    };
  }

  const filenameMatch = url.match(/[-_/](\d{2,5})x(\d{2,5})(?=\.[a-z]{2,5}(?:$|[?#]))/);
  if (filenameMatch) {
    return {
      width: Number(filenameMatch[1]),
      height: Number(filenameMatch[2]),
    };
  }

  const apiPathMatch = url.match(/\/(\d{3,5})\/(\d{3,5})\/[a-z0-9_-]+$/);
  if (apiPathMatch) {
    return {
      width: Number(apiPathMatch[1]),
      height: Number(apiPathMatch[2]),
    };
  }

  return { width: null, height: null };
}

function extractWixImageInfo(attrs) {
  if (!attrs["data-image-info"]) return null;

  try {
    const decoded = htmlDecode(attrs["data-image-info"]);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractWixOriginalUrl(attrs) {
  const info = extractWixImageInfo(attrs);
  const uri = info?.imageData?.uri;
  if (!uri) return null;
  return `https://static.wixstatic.com/media/${uri}`;
}

function candidateUrlsFromAttrs(attrs, baseUrl) {
  const urls = [];
  const attrNames = [
    "data-src",
    "data-lazy-src",
    "data-orig-file",
    "data-large-file",
    "src",
  ];

  const wixOriginalUrl = extractWixOriginalUrl(attrs);
  if (wixOriginalUrl) {
    urls.push({ url: wixOriginalUrl, type: "img:wix-original" });
  }

  if (attrs.srcset) {
    const srcsetUrl = parseSrcsetCandidate(attrs.srcset, baseUrl);
    if (srcsetUrl) {
      urls.push({ url: srcsetUrl, type: "img:srcset" });
    }
  }

  for (const attrName of attrNames) {
    const url = absolutize(baseUrl, attrs[attrName]);
    if (!url) continue;
    urls.push({ url, type: `img:${attrName}` });
  }

  return urls.filter((entry, index, array) => {
    if (!entry.url) return false;
    return array.findIndex((candidate) => candidate.url === entry.url) === index;
  });
}

function numericValue(value) {
  if (!value) return null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function extractMetaCandidates(html, baseUrl) {
  const headEnd = html.search(/<\/head>/i);
  const headHtml = headEnd >= 0 ? html.slice(0, headEnd) : html;
  const candidates = [];

  for (const match of headHtml.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const attrs = parseAttributes(tag);
    const property = (attrs.property ?? attrs.name ?? attrs.itemprop ?? "")
      .toLowerCase()
      .trim();
    if (!property) continue;

    if (!["og:image", "twitter:image", "image"].includes(property)) continue;

    const url = absolutize(baseUrl, attrs.content);
    if (!url) continue;

    candidates.push({
      type: `meta:${property}`,
      url,
      width: numericValue(attrs.width),
      height: numericValue(attrs.height),
      attrText: `${property} ${attrs.content ?? ""}`,
      context: tag,
      position: 0,
    });
  }

  return candidates;
}

function extractImgCandidates(html, baseUrl) {
  const bodyStart = html.search(/<body\b/i);
  const bodyHtml = bodyStart >= 0 ? html.slice(bodyStart) : html;
  const bodyLength = bodyHtml.length || 1;
  const candidates = [];

  for (const match of bodyHtml.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const attrs = parseAttributes(tag);
    const index = match.index ?? 0;
    const context = bodyHtml.slice(
      Math.max(0, index - 180),
      Math.min(bodyLength, index + tag.length + 180)
    );
    const explicitWidth = numericValue(attrs.width);
    const explicitHeight = numericValue(attrs.height);

    for (const candidateSource of candidateUrlsFromAttrs(attrs, baseUrl)) {
      const inferredDimensions = inferDimensionsFromUrl(candidateSource.url);
      candidates.push({
        type: candidateSource.type,
        url: candidateSource.url,
        width: explicitWidth ?? inferredDimensions.width,
        height: explicitHeight ?? inferredDimensions.height,
        attrText: [
          attrs.class,
          attrs.id,
          attrs.alt,
          attrs.fetchpriority,
          attrs.loading,
        ]
          .filter(Boolean)
          .join(" "),
        context,
        position: index / bodyLength,
      });
    }
  }

  return candidates;
}

function extractDataImageInfoCandidates(html) {
  const bodyStart = html.search(/<body\b/i);
  const bodyHtml = bodyStart >= 0 ? html.slice(bodyStart) : html;
  const bodyLength = bodyHtml.length || 1;
  const candidates = [];
  const tagPattern =
    /<([A-Za-z0-9:-]+)\b[^>]*data-image-info=(?:"([^"]*)"|'([^']*)')[^>]*>/gi;

  for (const match of bodyHtml.matchAll(tagPattern)) {
    const tag = match[0];
    const attrs = parseAttributes(tag);
    const url = extractWixOriginalUrl(attrs);
    if (!url) continue;

    const info = extractWixImageInfo(attrs);
    const width =
      Number(info?.imageData?.width ?? 0) ||
      Number(info?.targetWidth ?? 0) ||
      null;
    const height =
      Number(info?.imageData?.height ?? 0) ||
      Number(info?.targetHeight ?? 0) ||
      null;
    const index = match.index ?? 0;
    const context = bodyHtml.slice(
      Math.max(0, index - 180),
      Math.min(bodyLength, index + tag.length + 180)
    );

    candidates.push({
      type: "wix:data-image-info",
      url,
      width,
      height,
      attrText: [attrs.class, attrs.id, attrs["data-testid"]]
        .filter(Boolean)
        .join(" "),
      context,
      position: index / bodyLength,
    });
  }

  return candidates;
}

function extractBackgroundCandidates(html, baseUrl) {
  const bodyStart = html.search(/<body\b/i);
  const bodyHtml = bodyStart >= 0 ? html.slice(bodyStart) : html;
  const bodyLength = bodyHtml.length || 1;
  const candidates = [];
  const tagPattern =
    /<([A-Za-z0-9:-]+)\b[^>]*style=(?:"([^"]*)"|'([^']*)')[^>]*>/gi;

  for (const match of bodyHtml.matchAll(tagPattern)) {
    const tag = match[0];
    const styleText = htmlDecode(match[2] ?? match[3] ?? "");
    if (!/background-image/i.test(styleText)) continue;

    const urlMatch = styleText.match(
      /background-image\s*:\s*url\((['"]?)([^"')]+)\1\)/i
    );
    const url = absolutize(baseUrl, urlMatch?.[2] ?? "");
    if (!url) continue;

    const attrs = parseAttributes(tag);
    const index = match.index ?? 0;
    const context = bodyHtml.slice(
      Math.max(0, index - 180),
      Math.min(bodyLength, index + tag.length + 180)
    );

    candidates.push({
      type: "background-image",
      url,
      width: null,
      height: null,
      attrText: [attrs.class, attrs.id, styleText].filter(Boolean).join(" "),
      context,
      position: index / bodyLength,
    });
  }

  return candidates;
}

function scoreTokenSet(text) {
  let score = 0;

  for (const [token, tokenScore] of HERO_TOKENS) {
    if (text.includes(token)) score += tokenScore;
  }

  for (const token of BAD_TOKENS) {
    if (text.includes(token)) score -= 140;
  }

  return score;
}

function rootDomain(hostname) {
  const parts = hostname.split(".").filter(Boolean);
  return parts.slice(-2).join(".");
}

function isRelatedImageSource(pageUrl, imageUrl) {
  try {
    const pageHost = new URL(pageUrl).hostname.replace(/^www\./, "");
    const imageHost = new URL(imageUrl).hostname.replace(/^www\./, "");

    if (pageHost === imageHost) return true;
    if (rootDomain(pageHost) === rootDomain(imageHost)) return true;
    if (TRUSTED_EXTERNAL_IMAGE_HOSTS.has(imageHost)) return true;

    return false;
  } catch {
    return false;
  }
}

function scoreCandidate(candidate, pageUrl) {
  const urlText = candidate.url.toLowerCase();
  const contextText = candidate.context.toLowerCase();
  const attrText = candidate.attrText.toLowerCase();
  const combinedText = `${urlText} ${contextText} ${attrText}`;

  if (
    urlText.includes("google.com/s2/favicons") ||
    urlText.includes("/null") ||
    urlText.endsWith(".svg") ||
    urlText.endsWith(".ico")
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;

  score += scoreTokenSet(combinedText);

  if (!isRelatedImageSource(pageUrl, candidate.url)) {
    score -= 140;
  }

  if (candidate.type.startsWith("img")) score += 20;
  if (candidate.type === "img:wix-original") score += 24;
  if (candidate.type === "wix:data-image-info") score += 34;
  if (candidate.type === "img:data-src") score += 10;
  if (candidate.type === "background-image") score += 28;
  if (candidate.type === "meta:og:image") score += 10;
  if (candidate.type === "meta:twitter:image") score += 4;

  if (combinedText.includes("fetchpriority=\"high\"")) score += 18;
  if (combinedText.includes("loading=\"eager\"")) score += 10;
  if (attrText.includes("high")) score += 8;
  if (candidate.position <= 0.15) score += 22;
  else if (candidate.position <= 0.3) score += 12;
  else if (candidate.position >= 0.7) score -= 60;
  else if (candidate.position >= 0.5) score -= 30;

  const width = candidate.width ?? 0;
  const height = candidate.height ?? 0;

  if (width >= 1600) score += 26;
  else if (width >= 1000) score += 18;
  else if (width >= 700) score += 10;
  else if (width > 0 && width < 400) score -= 70;
  else if (width > 0 && width < 600) score -= 24;

  if (height >= 300) score += 14;
  else if (height >= 220) score += 8;
  else if (height > 0 && height < 180) score -= 34;
  else if (height > 0 && height < 220) score -= 20;

  if (width > 0 && height > 0 && width * height < 150000) {
    score -= 32;
  }

  if (width > 0 && height > 0) {
    const aspect = width / height;
    if (aspect >= 1.6 && aspect <= 6) score += 18;
    else if (aspect >= 1.25 && aspect < 1.6) score += 10;
    else if (aspect >= 0.8 && aspect <= 1.2) score -= 25;
    else if (aspect < 0.8) score -= 18;
  }

  if (/\.(?:jpe?g|png|gif)$/i.test(attrText) && width > 0 && width < 500) {
    score -= 18;
  }

  try {
    const pageHost = new URL(pageUrl).hostname.replace(/^www\./, "");
    const candidateHost = new URL(candidate.url).hostname.replace(/^www\./, "");
    if (candidateHost === pageHost) score += 10;
  } catch {
    // ignore host scoring errors
  }

  return score;
}

async function validateImage(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": USER_AGENT },
    });
    const contentType = response.headers.get("content-type") ?? "";
    await response.body?.cancel?.().catch(() => undefined);

    return {
      ok: response.ok && contentType.startsWith("image/"),
      status: response.status,
      contentType,
      finalUrl: response.url,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      contentType: "",
      finalUrl: url,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function dedupeCandidates(candidates, pageUrl) {
  const ranked = candidates
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate, pageUrl),
    }))
    .filter((candidate) => Number.isFinite(candidate.score))
    .sort((a, b) => b.score - a.score);

  const seen = new Set();
  const unique = [];

  for (const candidate of ranked) {
    const key = candidate.url;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(candidate);
  }

  return unique;
}

async function discoverCoverForOrg(organization) {
  const response = await fetch(organization.website_url, {
    redirect: "follow",
    headers: { "user-agent": USER_AGENT },
  });

  const html = await response.text();
  const pageUrl = response.url;
  const candidates = dedupeCandidates(
    [
      ...extractMetaCandidates(html, pageUrl),
      ...extractImgCandidates(html, pageUrl),
      ...extractDataImageInfoCandidates(html),
      ...extractBackgroundCandidates(html, pageUrl),
    ],
    pageUrl
  );

  const inspected = [];

  for (const candidate of candidates.slice(0, MAX_VALIDATION_ATTEMPTS)) {
    const validation = await validateImage(candidate.url);
    inspected.push({
      url: candidate.url,
      score: candidate.score,
      type: candidate.type,
      status: validation.status,
      contentType: validation.contentType,
    });

    if (!validation.ok || candidate.score < MIN_SCORE) {
      continue;
    }

    return {
      organization,
      pageUrl,
      selected: {
        url: validation.finalUrl,
        sourceUrl: candidate.url,
        score: candidate.score,
        type: candidate.type,
      },
      inspected,
    };
  }

  return {
    organization,
    pageUrl,
    selected: null,
    inspected,
  };
}

async function mapPool(items, worker, concurrency = CONCURRENCY) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run()
  );
  await Promise.all(workers);
  return results;
}

function escapeSql(value) {
  return value.replace(/'/g, "''");
}

function buildSql(results) {
  const duplicateCounts = new Map();
  for (const result of results) {
    if (!result.selected) continue;
    duplicateCounts.set(
      result.selected.url,
      (duplicateCounts.get(result.selected.url) ?? 0) + 1
    );
  }

  const statements = results
    .filter((result) => {
      if (!result.selected) return false;

      const duplicateCount = duplicateCounts.get(result.selected.url) ?? 0;
      const pageHost = new URL(result.pageUrl).hostname.replace(/^www\./, "");
      const sharedMunicipalityBanner =
        duplicateCount > 1 &&
        (GENERIC_ROOT_HOSTS.has(pageHost) ||
          result.pageUrl.includes("/vereinsliste/"));

      return !sharedMunicipalityBanner;
    })
    .map(
      (result) =>
        `update public.organizations set\n  cover_image_url = '${escapeSql(
          result.selected.url
        )}'\nwhere slug = '${escapeSql(result.organization.slug)}';`
    );

  return [
    "-- Smart cover images discovered from organization websites",
    "-- Generated by scripts/discover-org-cover-images.mjs",
    "",
    ...statements,
    "",
  ].join("\n");
}

async function applyManualOverrides(results) {
  const overrides = [];

  for (const result of results) {
    const overrideUrl = MANUAL_COVER_OVERRIDES.get(result.organization.slug);
    if (!overrideUrl) {
      overrides.push(result);
      continue;
    }

    const validation = await validateImage(overrideUrl);
    overrides.push({
      ...result,
      selected: validation.ok
        ? {
            url: validation.finalUrl,
            sourceUrl: overrideUrl,
            score: 1000,
            type: "manual-override",
          }
        : result.selected,
      inspected: [
        ...result.inspected,
        {
          url: overrideUrl,
          score: 1000,
          type: "manual-override",
          status: validation.status,
          contentType: validation.contentType,
        },
      ],
    });
  }

  return overrides;
}

function filterResultsForSql(results) {
  const duplicateCounts = new Map();

  for (const result of results) {
    if (!result.selected) continue;
    duplicateCounts.set(
      result.selected.url,
      (duplicateCounts.get(result.selected.url) ?? 0) + 1
    );
  }

  return results.filter((result) => {
    if (!result.selected) return false;

    const duplicateCount = duplicateCounts.get(result.selected.url) ?? 0;
    const pageHost = new URL(result.pageUrl).hostname.replace(/^www\./, "");
    const sharedMunicipalityBanner =
      duplicateCount > 1 &&
      (GENERIC_ROOT_HOSTS.has(pageHost) ||
        result.pageUrl.includes("/vereinsliste/"));

    return !sharedMunicipalityBanner;
  });
}

async function main() {
  const env = {
    ...process.env,
    ...loadEnvFile(path.join(root, ".env.local")),
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local"
    );
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("organizations")
    .select("slug, name, website_url, cover_image_url")
    .not("website_url", "is", null)
    .order("name");

  if (error) throw error;

  const organizations = (data ?? []).filter(
    (organization) =>
      organization.website_url &&
      !organization.cover_image_url &&
      !isGenericWebsite(organization.website_url)
  );

  console.log(
    `Inspecting ${organizations.length} organization websites for cover images...`
  );

  const results = await mapPool(organizations, async (organization) => {
    try {
      const result = await discoverCoverForOrg(organization);
      const winner = result.selected?.url ?? "none";
      console.log(`${organization.slug}: ${winner}`);
      return result;
    } catch (error) {
      console.log(
        `${organization.slug}: error ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return {
        organization,
        pageUrl: organization.website_url,
        selected: null,
        inspected: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  const overriddenResults = await applyManualOverrides(results);
  const selectedForSql = filterResultsForSql(overriddenResults);

  fs.writeFileSync(outputPath, buildSql(selectedForSql));

  console.log(
    `\nWrote ${outputPath} with ${selectedForSql.length} cover image updates.`
  );
  console.log(
    JSON.stringify(
      selectedForSql.map((result) => ({
        slug: result.organization.slug,
        name: result.organization.name,
        website_url: result.organization.website_url,
        page_url: result.pageUrl,
        cover_image_url: result.selected.url,
        score: result.selected.score,
        type: result.selected.type,
      })),
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
