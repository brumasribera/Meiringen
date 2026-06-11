export function faviconFromWebsite(websiteUrl: string): string {
  try {
    const hostname = new URL(websiteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return "";
  }
}

export function resolveOrgImageUrl(
  imageUrl: string | null,
  websiteUrl: string | null
): string | null {
  if (imageUrl) return imageUrl;
  if (websiteUrl) return faviconFromWebsite(websiteUrl);
  return null;
}
