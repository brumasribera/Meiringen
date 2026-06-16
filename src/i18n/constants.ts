export const locales = ["de", "gsw", "en", "es", "ca", "fr", "it", "rm", "pt"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";
export const localeCookieName = "NEXT_LOCALE";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
