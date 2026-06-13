import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import {
  defaultLocale,
  localeCookieMaxAge,
  localeCookieName,
  locales,
} from "./constants";

export type { Locale } from "./constants";
export { defaultLocale, localeCookieMaxAge, localeCookieName, locales };

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "never",
  localeCookie: {
    name: localeCookieName,
    maxAge: localeCookieMaxAge,
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
