const GENERIC_PORTAL_DOMAINS = [
  "haslital-brienz.ch",
  "vereinsverzeichnis.ch",
  "localcities.ch",
];

const LOCAL_LOGO_ASSETS: Record<string, string> = {
  "mgmeiringen.ch": "/brand/org-logos/mgmeiringen.ch.png",
  "meiringen.ch": "/brand/org-logos/meiringen-ch.png",
  "haslital-brienz.ch": "/brand/org-logos/haslital-brienz-ch.png",
  "brienz.ch": "/brand/org-logos/brienz-ch.png",
  "innertkirchen.ch": "/brand/org-logos/innertkirchen-ch.png",
  "guttannen.ch": "/brand/org-logos/guttannen-ch.png",
  "hasliberg.ch": "/brand/org-logos/hasliberg-ch.png",
  "kino-meiringen.ch": "/brand/org-logos/kino-meiringen.ch.png",
  "tvmeiringen.ch": "/brand/org-logos/tvmeiringen.ch.png",
  "schwingklub-meiringen.ch": "/brand/org-logos/schwingklub-meiringen.ch.png",
  "tennismeiringen.ch": "/brand/org-logos/tennismeiringen.ch.png",
  "sac-cas.ch": "/brand/org-logos/sac-cas.ch.png",
  "procap.ch": "/brand/org-logos/procap.ch.png",
  "lgwilligen.ch": "/brand/org-logos/lgwilligen.ch.svg",
  "samariter-meiringen.ch": "/brand/org-logos/samariter-meiringen.ch.svg",
  "reitverein-oberhasli-brienz.ch": "/brand/org-logos/reitverein-oberhasli-brienz.ch.svg",
  "kmu-oberhasli.ch": "/brand/org-logos/kmu-oberhasli.ch.svg",
  "fv-oberhasli.ch": "/brand/org-logos/fv-oberhasli.ch.svg",
  "slrg-thunoberland.ch": "/brand/org-logos/slrg-thunoberland.ch.svg",
};

const LOCAL_LOGO_ASSET_VERSION = "20260616";

export function isGenericPortalFavicon(imageUrl: string): boolean {
  return GENERIC_PORTAL_DOMAINS.some((domain) =>
    imageUrl.includes(`domain=${domain}`)
  );
}

export function isLikelyOrgIconImage(imageUrl: string): boolean {
  const normalized = imageUrl.toLowerCase();
  return (
    normalized.includes("google.com/s2/favicons") ||
    normalized.includes("favicon") ||
    normalized.includes("apple-touch-icon") ||
    normalized.endsWith(".ico")
  );
}

const LOCALITY_LOGO_DOMAINS: Record<string, string> = {
  meiringen: "meiringen.ch",
  balm: "meiringen.ch",
  hausen: "meiringen.ch",
  schattenhalb: "meiringen.ch",
  willigen: "meiringen.ch",
  brienz: "brienz.ch",
  brienzwiler: "brienz.ch",
  oberried: "brienz.ch",
  schwanden: "brienz.ch",
  hofstetten: "brienz.ch",
  innertkirchen: "innertkirchen.ch",
  gadmen: "innertkirchen.ch",
  guttannen: "guttannen.ch",
  hasliberg: "hasliberg.ch",
};

export function resolveOrgImageUrl(
  imageUrl: string | null,
  websiteUrl: string | null,
  locality?: string | null
): string | null {
  const withCacheBust = (asset: string) =>
    `${asset}?v=${LOCAL_LOGO_ASSET_VERSION}`;

  if (imageUrl && imageUrl.startsWith("/brand/org-logos/")) {
    return withCacheBust(imageUrl);
  }

  if (imageUrl && !isGenericPortalFavicon(imageUrl)) {
    return imageUrl;
  }

  if (websiteUrl) {
    try {
      const hostname = new URL(websiteUrl).hostname.replace(/^www\./, "");
      const localAsset = LOCAL_LOGO_ASSETS[hostname];
      if (localAsset) return withCacheBust(localAsset);
    } catch {
      // Ignore malformed URLs and fall through to locality mapping.
    }
  }

  if (locality && LOCALITY_LOGO_DOMAINS[locality]) {
    const localityDomain = LOCALITY_LOGO_DOMAINS[locality];
    const asset = LOCAL_LOGO_ASSETS[localityDomain];
    return asset ? withCacheBust(asset) : null;
  }

  return null;
}

function isUsableCoverImage(imageUrl: string | null | undefined): imageUrl is string {
  if (
    !imageUrl ||
    isGenericPortalFavicon(imageUrl) ||
    isLikelyOrgIconImage(imageUrl)
  ) {
    return false;
  }

  return true;
}

export function resolveOrgCoverImageUrl(
  coverImageUrl: string | null,
  imageUrl?: string | null
): string | null {
  if (isUsableCoverImage(coverImageUrl)) {
    return coverImageUrl;
  }

  if (isUsableCoverImage(imageUrl)) {
    return imageUrl;
  }

  return null;
}

export function resolveOrgDescription(
  organization: {
    description: string | null;
    description_en: string | null;
  },
  locale: string
): string | null {
  if (locale === "en" && organization.description_en) {
    return organization.description_en;
  }
  return organization.description;
}
