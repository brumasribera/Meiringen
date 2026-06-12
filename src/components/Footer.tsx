"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SiteLogo } from "@/components/SiteLogo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:justify-between">
        <div>
          <SiteLogo href={null} />
          <p className="mt-2 text-sm text-muted">{t("tagline")}</p>
          <p className="mt-1 text-xs text-muted">{t("madeWith")}</p>
        </div>
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <Link href="/events" className="hover:text-primary">{nav("events")}</Link>
            <Link href="/organizations" className="hover:text-primary">{nav("organizations")}</Link>
            <Link href="/about" className="hover:text-primary">{nav("about")}</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/alerts" className="hover:text-primary">{nav("newsletter")}</Link>
            <Link href="/login" className="hover:text-primary">{nav("login")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
