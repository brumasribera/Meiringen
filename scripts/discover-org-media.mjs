import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoDir = path.join(root, "public", "brand", "org-logos");
const coverDir = path.join(root, "public", "brand", "org-covers");
const reportDir = path.join(root, "supabase", "research");
const reportPath = path.join(reportDir, "org-media-discovery.json");
const migrationPath = path.join(
  root,
  "supabase",
  "migrations",
  "0023_discovered_org_media.sql"
);

const USER_AGENT =
  "Mozilla/5.0 (compatible; MeiringenMediaDiscovery/1.0; +https://meiringen.life)";
const CONCURRENCY = 3;
const MAX_PAGES_PER_ORG = 14;
const MAX_IMAGES_PER_ORG = 18;
const LOGO_THRESHOLD = 78;
const COVER_THRESHOLD = 82;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const includeSearch = !args.has("--no-search");
const includeSocial = !args.has("--no-social");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const targetLimit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : 0;
const onlySlugs = onlyArg
  ? new Set(onlyArg.split("=")[1].split(",").map((slug) => slug.trim()).filter(Boolean))
  : null;

const DEFAULT_LOCAL_ASSETS = new Set([
  "/brand/org-logos/meiringen-ch.png",
  "/brand/org-logos/meiringen.ch.png",
  "/brand/org-logos/brienz-ch.png",
  "/brand/org-logos/innertkirchen-ch.png",
  "/brand/org-logos/guttannen-ch.png",
  "/brand/org-logos/hasliberg-ch.png",
  "/brand/org-logos/haslital-brienz-ch.png",
  "/brand/org-logos/brienzwiler.ch.svg",
  "/brand/org-logos/gadmen.ch.svg",
]);

const GENERIC_IMAGE_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "haslital-brienz.ch",
  "www.haslital-brienz.ch",
  "vereinsverzeichnis.ch",
  "www.vereinsverzeichnis.ch",
  "localcities.ch",
  "www.localcities.ch",
]);

const SOCIAL_HOSTS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "cdninstagram.com",
  "fbcdn.net",
  "fbsbx.com",
];

const BAD_URL_TOKENS = [
  "favicon",
  "apple-touch-icon",
  "sprite",
  "blank",
  "placeholder",
  "pixel",
  "tracking",
  "spacer",
  "loader",
  "twint",
  "qr",
  "sponsor",
  "partner",
  "map",
  "maps",
  "google",
];

const LOGO_TOKENS = [
  "logo",
  "profile",
  "avatar",
  "profil",
  "wappen",
  "club",
  "verein",
  "badge",
  "emblem",
  "brand",
];

const COVER_TOKENS = [
  "hero",
  "header",
  "banner",
  "cover",
  "slider",
  "team",
  "gruppe",
  "training",
  "event",
  "gallery",
  "og",
  "background",
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

function dbUrlFromEnv() {
  const env = { ...process.env, ...loadEnvFile(path.join(root, ".env.local")) };
  const value =
    env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || env.DATABASE_URL;
  return value ? value.replace("sslmode=require", "sslmode=no-verify") : null;
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

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function hostOf(urlString) {
  try {
    return new URL(urlString).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function absolutize(baseUrl, value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return null;
  }

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseSrcset(srcset, baseUrl) {
  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [urlPart, descriptor = ""] = entry.split(/\s+/);
      const width = descriptor.endsWith("w")
        ? Number.parseInt(descriptor, 10)
        : 0;
      return { url: absolutize(baseUrl, urlPart), width };
    })
    .filter((entry) => entry.url);

  candidates.sort((a, b) => b.width - a.width);
  return candidates[0]?.url ?? null;
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function orgTokens(org) {
  return unique(
    normalizeText(`${org.name} ${org.slug} ${org.locality ?? ""}`).split(/\s+/)
  ).filter((token) => token.length >= 3);
}

function candidateMatchesOrg(candidate, org) {
  const text = normalizeText(`${candidate.url} ${candidate.pageUrl} ${candidate.context}`);
  return orgTokens(org).some((token) => text.includes(token));
}

function safeBaseName(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function isGenericImageUrl(imageUrl) {
  if (!imageUrl) return true;
  const normalized = imageUrl.toLowerCase();
  if (normalized.includes("google.com/s2/favicons")) return true;
  if (normalized.includes("favicon")) return true;
  if (DEFAULT_LOCAL_ASSETS.has(imageUrl)) return true;

  try {
    const host = new URL(imageUrl, "https://meiringen.life").hostname;
    return GENERIC_IMAGE_HOSTS.has(host.replace(/^www\./, ""));
  } catch {
    return false;
  }
}

function hasSocialHost(urlString) {
  const host = hostOf(urlString);
  return SOCIAL_HOSTS.some((socialHost) => host === socialHost || host.endsWith(`.${socialHost}`));
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.toLowerCase().includes("text/html")) {
      return null;
    }
    return {
      url: response.url,
      html: await response.text(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBytes(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) return null;
    const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
    if (
      !contentType.startsWith("image/") &&
      !url.toLowerCase().match(/\.(png|jpe?g|webp|gif|svg)(\?|$)/)
    ) {
      return null;
    }
    return {
      url: response.url,
      contentType,
      buffer: Buffer.from(await response.arrayBuffer()),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function imageTypeFromContent(contentType, url) {
  const lower = `${contentType} ${url}`.toLowerCase();
  if (lower.includes("svg")) return "svg";
  if (lower.includes("png")) return "png";
  if (lower.includes("webp")) return "webp";
  if (lower.includes("gif")) return "gif";
  if (lower.includes("jpeg") || lower.includes("jpg")) return "jpg";
  return "jpg";
}

function imageDimensions(buffer, type) {
  if (type === "png" && buffer.length >= 24) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (type === "jpg" || type === "jpeg") {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }

  if (type === "webp" && buffer.length >= 30) {
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    const chunk = buffer.toString("ascii", 12, 16);
    if (riff === "RIFF" && webp === "WEBP" && chunk === "VP8X") {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
  }

  if (type === "svg") {
    const text = buffer.toString("utf8", 0, Math.min(buffer.length, 12000));
    const width = Number.parseFloat(text.match(/\bwidth=["']?([0-9.]+)/i)?.[1] ?? "");
    const height = Number.parseFloat(text.match(/\bheight=["']?([0-9.]+)/i)?.[1] ?? "");
    if (Number.isFinite(width) && Number.isFinite(height)) return { width, height };
    const viewBox = text.match(/\bviewBox=["'][^"']*?\s([0-9.]+)\s([0-9.]+)["']/i);
    if (viewBox) {
      return {
        width: Number.parseFloat(viewBox[1]),
        height: Number.parseFloat(viewBox[2]),
      };
    }
  }

  return { width: 0, height: 0 };
}

function extractSocialLinks(baseUrl, html) {
  if (!includeSocial) return [];
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const href = absolutize(baseUrl, attrs.href);
    if (href && hasSocialHost(href)) links.push(href);
  }
  return unique(links);
}

function extractImageCandidates(pageUrl, html, pageKind) {
  const candidates = [];

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (!key.includes("image")) continue;
    const imageUrl = absolutize(pageUrl, attrs.content);
    if (imageUrl) {
      candidates.push({
        url: imageUrl,
        pageUrl,
        pageKind,
        reason: key,
        context: key,
      });
    }
  }

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const rel = (attrs.rel || "").toLowerCase();
    if (!/(icon|image_src|preload)/.test(rel)) continue;
    const imageUrl = absolutize(pageUrl, attrs.href);
    if (imageUrl) {
      candidates.push({
        url: imageUrl,
        pageUrl,
        pageKind,
        reason: `link:${rel}`,
        context: `${rel} ${attrs.sizes ?? ""}`,
      });
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const imageUrl =
      parseSrcset(attrs.srcset ?? "", pageUrl) ||
      absolutize(pageUrl, attrs.src || attrs["data-src"] || attrs["data-lazy-src"]);
    if (imageUrl) {
      candidates.push({
        url: imageUrl,
        pageUrl,
        pageKind,
        reason: "img",
        context: `${attrs.alt ?? ""} ${attrs.title ?? ""} ${attrs.class ?? ""} ${attrs.id ?? ""}`,
        widthHint: Number.parseInt(attrs.width ?? "0", 10) || 0,
        heightHint: Number.parseInt(attrs.height ?? "0", 10) || 0,
      });
    }
  }

  for (const match of html.matchAll(/url\((['"]?)(.*?)\1\)/gi)) {
    const imageUrl = absolutize(pageUrl, match[2]);
    if (imageUrl) {
      candidates.push({
        url: imageUrl,
        pageUrl,
        pageKind,
        reason: "css-url",
        context: "css background",
      });
    }
  }

  return candidates;
}

function scoreCandidate(candidate, org, mediaKind, dimensions = null) {
  const tokens = orgTokens(org);
  const normalized = normalizeText(`${candidate.url} ${candidate.context} ${candidate.reason}`);
  const host = hostOf(candidate.url);
  let score = 0;

  if (mediaKind === "logo") {
    score += 35;
    for (const token of LOGO_TOKENS) if (normalized.includes(token)) score += 12;
    if (candidate.reason.includes("icon")) score -= 22;
    if (candidate.reason.includes("og:image")) score += 4;
  } else {
    score += 30;
    for (const token of COVER_TOKENS) if (normalized.includes(token)) score += 10;
    if (candidate.reason.includes("og:image")) score += 18;
    if (candidate.reason.includes("icon")) score -= 35;
  }

  for (const token of tokens) {
    if (normalized.includes(token)) score += 7;
  }

  if (candidate.pageKind === "official") score += 22;
  if (candidate.pageKind === "source") score += 10;
  if (candidate.pageKind === "social") score += 16;
  if (candidate.pageKind === "search") score += 4;
  if (
    (candidate.pageKind === "search" || candidate.pageKind === "social") &&
    !candidateMatchesOrg(candidate, org)
  ) {
    score -= 48;
  }
  if (candidate.pageKind === "source" && !candidateMatchesOrg(candidate, org)) {
    score -= 16;
  }
  if (hasSocialHost(candidate.url) || hasSocialHost(candidate.pageUrl)) score += 10;
  if (host && org.website_url && host === hostOf(org.website_url)) score += 18;

  for (const token of BAD_URL_TOKENS) {
    if (normalized.includes(token)) score -= 20;
  }

  if (dimensions) {
    const { width, height } = dimensions;
    const area = width * height;
    if (mediaKind === "logo") {
      if (width >= 80 && height >= 80) score += 10;
      if (width > 0 && height > 0 && area < 2800) score -= 20;
      if (width > 0 && height > 0) {
        const ratio = Math.max(width, height) / Math.max(1, Math.min(width, height));
        if (ratio > 5) score -= 60;
        else if (ratio > 3) score -= 18;
      }
    } else {
      if (width >= 700 && height >= 250) score += 20;
      if (width >= 1000) score += 8;
      if (width > 0 && height > 0 && width / height < 1.2) score -= 18;
      if (area > 0 && area < 120000) score -= 20;
    }
  }

  return score;
}

function searchQueries(org) {
  const locality = org.locality ? ` ${org.locality}` : "";
  return [
    `"${org.name}" logo`,
    `"${org.name}" Instagram`,
    `"${org.name}" Facebook`,
    `"${org.name}"${locality} Verein`,
    `"${org.name}"${locality} Fotos`,
  ];
}

function parseSearchLinks(baseUrl, html) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    let href = attrs.href;
    if (!href) continue;

    if (href.startsWith("/url?") || href.includes("/url?")) {
      try {
        const parsed = new URL(href, baseUrl);
        href = parsed.searchParams.get("q") ?? parsed.searchParams.get("url") ?? href;
      } catch {
        continue;
      }
    }

    const absolute = absolutize(baseUrl, href);
    if (!absolute) continue;
    const host = hostOf(absolute);
    if (
      host.includes("google.") ||
      host.includes("duckduckgo.") ||
      host.includes("bing.") ||
      host.includes("youtube.") ||
      host.includes("maps.google")
    ) {
      continue;
    }
    links.push(absolute);
  }
  return unique(links).slice(0, 5);
}

async function searchWeb(org) {
  if (!includeSearch) return [];
  const pages = [];
  for (const query of searchQueries(org).slice(0, 5)) {
    const encoded = encodeURIComponent(query);
    const urls = [
      `https://www.google.com/search?q=${encoded}`,
      `https://duckduckgo.com/html/?q=${encoded}`,
    ];

    for (const url of urls) {
      const result = await fetchText(url);
      if (!result) continue;
      pages.push(...parseSearchLinks(result.url, result.html));
      if (pages.length >= 10) return unique(pages).slice(0, 10);
    }
  }
  return unique(pages).slice(0, 10);
}

async function mapLimit(items, limit, mapper) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      results.push(await mapper(current));
    }
  });
  await Promise.all(workers);
  return results;
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function publicPath(filePath) {
  return `/${path.relative(path.join(root, "public"), filePath).replace(/\\/g, "/")}`;
}

async function discoverPages(org) {
  const initialPages = [
    org.website_url ? { url: org.website_url, kind: "official" } : null,
    org.source_url ? { url: org.source_url, kind: "source" } : null,
  ].filter(Boolean);

  const searchPages = (await searchWeb(org)).map((url) => ({
    url,
    kind: hasSocialHost(url) ? "social" : "search",
  }));

  const pageMap = new Map();
  for (const page of [...initialPages, ...searchPages]) {
    if (!pageMap.has(page.url)) pageMap.set(page.url, page);
  }

  const fetched = [];
  for (const page of [...pageMap.values()].slice(0, MAX_PAGES_PER_ORG)) {
    const result = await fetchText(page.url);
    if (!result) continue;
    fetched.push({ ...page, url: result.url, html: result.html });
    for (const socialUrl of extractSocialLinks(result.url, result.html)) {
      if (!pageMap.has(socialUrl)) {
        pageMap.set(socialUrl, { url: socialUrl, kind: "social" });
      }
    }
  }

  for (const page of [...pageMap.values()].filter((p) => p.kind === "social").slice(0, 6)) {
    if (fetched.some((item) => item.url === page.url)) continue;
    const result = await fetchText(page.url);
    if (result) fetched.push({ ...page, url: result.url, html: result.html });
  }

  return fetched;
}

async function validateCandidates(org, candidates, mediaKind) {
  const deduped = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate.url)) continue;
    seen.add(candidate.url);
    const preScore = scoreCandidate(candidate, org, mediaKind);
    deduped.push({ ...candidate, preScore });
  }

  deduped.sort((a, b) => b.preScore - a.preScore);
  const top = deduped.slice(0, MAX_IMAGES_PER_ORG);
  const validated = [];

  for (const candidate of top) {
    const fetched = await fetchBytes(candidate.url);
    if (!fetched) continue;
    const type = imageTypeFromContent(fetched.contentType, fetched.url);
    const dimensions = imageDimensions(fetched.buffer, type);
    const score = scoreCandidate(
      { ...candidate, url: fetched.url },
      org,
      mediaKind,
      dimensions
    );
    const sha256 = crypto.createHash("sha256").update(fetched.buffer).digest("hex");
    validated.push({
      ...candidate,
      url: fetched.url,
      score,
      dimensions,
      type,
      bytes: fetched.buffer.length,
      sha256,
      buffer: fetched.buffer,
    });
  }

  validated.sort((a, b) => b.score - a.score);
  return validated;
}

function shouldAuditOrg(org, repeatedImages) {
  if (isGenericImageUrl(org.image_url)) return true;
  if (org.image_url && repeatedImages.has(org.image_url)) return true;
  if (!org.cover_image_url || isGenericImageUrl(org.cover_image_url)) return true;
  return false;
}

function writeCandidateFile(org, candidate, mediaKind) {
  const dir = mediaKind === "logo" ? logoDir : coverDir;
  const host = safeBaseName(hostOf(candidate.url) || "media");
  const ext = candidate.type === "jpeg" ? "jpg" : candidate.type;
  const fileName = `${org.slug}.${host}.${mediaKind}.${ext}`;
  const filePath = path.join(dir, fileName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, candidate.buffer);
  return publicPath(filePath);
}

function withoutBuffer(candidate) {
  const copy = { ...candidate };
  delete copy.buffer;
  return copy;
}

async function loadOrganizations() {
  const dbUrl = dbUrlFromEnv();
  if (!dbUrl) {
    throw new Error("No database URL found in environment or .env.local");
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  const { rows } = await client.query(
    `select id, name, slug, locality, website_url, source_url, image_url, cover_image_url
     from public.organizations
     order by name`
  );
  await client.end();
  return rows;
}

function repeatedImageUrls(orgs) {
  const counts = new Map();
  for (const org of orgs) {
    if (!org.image_url) continue;
    counts.set(org.image_url, (counts.get(org.image_url) ?? 0) + 1);
  }
  return new Set(
    [...counts.entries()]
      .filter(([imageUrl, count]) => count > 1 && DEFAULT_LOCAL_ASSETS.has(imageUrl))
      .map(([imageUrl]) => imageUrl)
  );
}

async function discoverOrgMedia(org) {
  const pages = await discoverPages(org);
  const candidates = pages.flatMap((page) =>
    extractImageCandidates(page.url, page.html, page.kind)
  );

  const [logos, covers] = await Promise.all([
    validateCandidates(org, candidates, "logo"),
    validateCandidates(org, candidates, "cover"),
  ]);

  const logo = logos.find((candidate) => candidate.score >= LOGO_THRESHOLD) ?? null;
  const cover = covers.find((candidate) => candidate.score >= COVER_THRESHOLD) ?? null;

  const result = {
    slug: org.slug,
    name: org.name,
    current_image_url: org.image_url,
    current_cover_image_url: org.cover_image_url,
    pages_checked: pages.map((page) => ({ url: page.url, kind: page.kind })),
    selected_logo: logo
      ? {
          url: logo.url,
          page_url: logo.pageUrl,
          score: logo.score,
          dimensions: logo.dimensions,
          bytes: logo.bytes,
          sha256: logo.sha256,
        }
      : null,
    selected_cover: cover
      ? {
          url: cover.url,
          page_url: cover.pageUrl,
          score: cover.score,
          dimensions: cover.dimensions,
          bytes: cover.bytes,
          sha256: cover.sha256,
        }
      : null,
    logo_candidates: logos.slice(0, 5).map(withoutBuffer),
    cover_candidates: covers.slice(0, 5).map(withoutBuffer),
    needs_review: !logo && !cover,
  };

  if (!dryRun) {
    Object.defineProperty(result, "_logoCandidate", {
      value: logo,
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(result, "_coverCandidate", {
      value: cover,
      enumerable: false,
      configurable: true,
    });
  }

  return result;
}

function rejectRepeatedSelections(results, mediaKind) {
  const selectedKey = mediaKind === "logo" ? "selected_logo" : "selected_cover";
  const privateKey = mediaKind === "logo" ? "_logoCandidate" : "_coverCandidate";
  const groups = new Map();

  for (const result of results) {
    const candidate = result[privateKey];
    if (!candidate?.sha256) continue;
    const group = groups.get(candidate.sha256) ?? [];
    group.push(result);
    groups.set(candidate.sha256, group);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    for (const result of group) {
      result[`${mediaKind}_rejected_reason`] =
        "Same image hash selected for multiple organizations; needs manual review.";
      result[selectedKey] = null;
      Object.defineProperty(result, privateKey, {
        value: null,
        enumerable: false,
        configurable: true,
      });
      result.needs_review = true;
    }
  }
}

function writeAcceptedMedia(results) {
  for (const result of results) {
    const logo = result._logoCandidate;
    if (logo && result.selected_logo) {
      result.local_logo_path = writeCandidateFile(result, logo, "logo");
    }

    const cover = result._coverCandidate;
    if (cover && result.selected_cover) {
      result.local_cover_path = writeCandidateFile(result, cover, "cover");
    }
  }
}

function writeMigration(results) {
  const statements = [
    "-- Discovered organization media from official, social and search sources",
  ];

  for (const result of results) {
    const assignments = [];
    if (result.local_logo_path) {
      assignments.push(`  image_url = '${sqlEscape(result.local_logo_path)}'`);
    }
    if (result.local_cover_path) {
      assignments.push(`  cover_image_url = '${sqlEscape(result.local_cover_path)}'`);
      assignments.push(
        `  cover_image_credit = '${sqlEscape(hostOf(result.selected_cover.page_url) || "source")}'`
      );
      assignments.push(
        `  cover_image_credit_url = '${sqlEscape(result.selected_cover.page_url)}'`
      );
    }
    if (!assignments.length) continue;

    statements.push("");
    statements.push(`update public.organizations set`);
    statements.push(assignments.join(",\n"));
    statements.push(`where slug = '${sqlEscape(result.slug)}';`);
  }

  fs.writeFileSync(migrationPath, `${statements.join("\n")}\n`);
}

async function main() {
  fs.mkdirSync(reportDir, { recursive: true });

  const orgs = await loadOrganizations();
  const repeatedImages = repeatedImageUrls(orgs);
  let targetOrgs = orgs.filter((org) => shouldAuditOrg(org, repeatedImages));
  if (onlySlugs) {
    targetOrgs = targetOrgs.filter((org) => onlySlugs.has(org.slug));
  }
  if (targetLimit > 0) {
    targetOrgs = targetOrgs.slice(0, targetLimit);
  }

  console.log(`Organizations: ${orgs.length}`);
  console.log(`Media audit targets: ${targetOrgs.length}`);

  const results = await mapLimit(targetOrgs, CONCURRENCY, async (org) => {
    console.log(`Scanning ${org.slug}`);
    return discoverOrgMedia(org);
  });

  if (!dryRun) {
    rejectRepeatedSelections(results, "logo");
    rejectRepeatedSelections(results, "cover");
    writeAcceptedMedia(results);
  }

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: dryRun,
    include_search: includeSearch,
    include_social: includeSocial,
    thresholds: {
      logo: LOGO_THRESHOLD,
      cover: COVER_THRESHOLD,
    },
    target_count: targetOrgs.length,
    selected_logo_count: results.filter((result) => result.selected_logo).length,
    selected_cover_count: results.filter((result) => result.selected_cover).length,
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (!dryRun) writeMigration(results);

  console.log(`Wrote ${reportPath}`);
  if (!dryRun) console.log(`Wrote ${migrationPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
