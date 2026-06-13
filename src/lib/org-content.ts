const GENERIC_PORTAL_DOMAINS = [
  "haslital-brienz.ch",
  "vereinsverzeichnis.ch",
  "localcities.ch",
];

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

export function faviconFromWebsite(websiteUrl: string): string {
  try {
    const hostname = new URL(websiteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return "";
  }
}

const LOCALITY_LOGO_DOMAINS: Record<string, string> = {
  meiringen: "meiringen.ch",
  balm: "meiringen.ch",
  hausen: "meiringen.ch",
  schattenhalb: "meiringen.ch",
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
  if (imageUrl && !isGenericPortalFavicon(imageUrl)) {
    return imageUrl;
  }

  if (websiteUrl) {
    const websiteFavicon = faviconFromWebsite(websiteUrl);
    if (websiteFavicon) return websiteFavicon;
  }

  if (locality && LOCALITY_LOGO_DOMAINS[locality]) {
    return faviconFromWebsite(
      `https://www.${LOCALITY_LOGO_DOMAINS[locality]}`
    );
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
