export const locales = ["gsw", "en", "de", "fr", "it", "rm", "pt", "es", "ca"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";
export const localeCookieName = "NEXT_LOCALE";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
