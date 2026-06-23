export const ORGANIZATION_CATEGORIES = [
  "culture",
  "sport",
  "social",
  "integration",
  "education",
  "music",
  "nature",
  "festival",
  "market",
  "other",
] as const;

export type OrganizationCategory = (typeof ORGANIZATION_CATEGORIES)[number];

export const EVENT_CATEGORIES = [
  ...ORGANIZATION_CATEGORIES,
  "tradition",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type Category = OrganizationCategory | EventCategory;

export const ORGANIZATION_STATUSES = ["draft", "published", "archived"] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export const LOCALITIES = [
  { id: "meiringen", lat: 46.7275, lng: 8.1875 },
  { id: "balm", lat: 46.735, lng: 8.18 },
  { id: "hausen", lat: 46.736, lng: 8.179 },
  { id: "schattenhalb", lat: 46.71, lng: 8.21 },
  { id: "willigen", lat: 46.71, lng: 8.215 },
  { id: "brienz", lat: 46.755, lng: 8.038 },
  { id: "brienzwiler", lat: 46.75, lng: 8.09 },
  { id: "oberried", lat: 46.73, lng: 8.1 },
  { id: "schwanden", lat: 46.76, lng: 8.13 },
  { id: "hofstetten", lat: 46.78, lng: 8.07 },
  { id: "innertkirchen", lat: 46.7, lng: 8.23 },
  { id: "gadmen", lat: 46.735, lng: 8.35 },
  { id: "guttannen", lat: 46.66, lng: 8.29 },
  { id: "hasliberg", lat: 46.75, lng: 8.17 },
] as const;

export type Locality = (typeof LOCALITIES)[number]["id"];

export function getLocalityCenter(locality: Locality): { lat: number; lng: number } {
  const match = LOCALITIES.find((entry) => entry.id === locality);
  return match ?? LOCALITIES[0];
}

export const CONTENT_LANGUAGES = [
  "de",
  "gsw",
  "en",
  "fr",
  "it",
  "rm",
  "pt",
  "es",
  "ca",
] as const;

export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

export const EVENT_STATUSES = ["draft", "published"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const ALERT_FREQUENCIES = ["weekly", "monthly"] as const;
export type AlertFrequency = (typeof ALERT_FREQUENCIES)[number];

export const SCRAPER_TYPES = ["generic", "meiringen_ch", "haslital_ch"] as const;
export type ScraperType = (typeof SCRAPER_TYPES)[number];
