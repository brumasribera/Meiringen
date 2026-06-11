export const CATEGORIES = [
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

export type Category = (typeof CATEGORIES)[number];

export const CONTENT_LANGUAGES = [
  "de",
  "gsw",
  "en",
  "fr",
  "it",
  "rm",
  "pt",
] as const;

export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

export const EVENT_STATUSES = ["draft", "published"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const SCRAPER_TYPES = ["generic", "meiringen_ch", "haslital_ch"] as const;
export type ScraperType = (typeof SCRAPER_TYPES)[number];
