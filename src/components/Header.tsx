"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setIsAdmin(data?.role === "admin"));
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  const links = [
    { href: "/", label: t("home") },
    { href: "/events", label: t("events") },
    { href: "/organizations", label: t("organizations") },
    { href: "/about", label: t("about") },
  ];

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Meiringen<span className="text-accent">.org</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <select
            value={locale}
            onChange={(e) => {
              window.location.href = `/${e.target.value}${pathname}`;
            }}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
            aria-label="Language"
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>

          {user ? (
            <>
              <Link
                href="/account/newsletter"
                className="text-sm font-medium text-muted hover:text-primary"
              >
                {t("newsletter")}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-accent hover:text-primary"
                >
                  {t("admin")}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-light"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-light"
            >
              {t("login")}
            </Link>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/account/newsletter" className="text-sm" onClick={() => setMenuOpen(false)}>{t("newsletter")}</Link>
                {isAdmin && <Link href="/admin" className="text-sm" onClick={() => setMenuOpen(false)}>{t("admin")}</Link>}
                <button onClick={handleLogout} className="text-left text-sm text-primary">{t("logout")}</button>
              </>
            ) : (
              <Link href="/login" className="text-sm text-primary" onClick={() => setMenuOpen(false)}>{t("login")}</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
