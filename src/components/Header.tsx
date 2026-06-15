"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SiteLogo } from "@/components/SiteLogo";
import { UserAccountMenu } from "@/components/UserAccountMenu";
import { LanguagePicker } from "@/components/LanguagePicker";
import { actionButtonClass } from "@/lib/button-styles";
import { HeaderSearch } from "@/components/HeaderSearch";

async function loadIsAdmin(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        setIsAdmin(await loadIsAdmin(supabase, data.user.id));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadIsAdmin(supabase, session.user.id).then(setIsAdmin);
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
    window.location.href = "/";
  }

  const links = [
    { href: "/", label: t("home") },
    { href: "/events", label: t("events") },
    { href: "/organizations", label: t("organizations") },
    { href: "/alerts", label: t("newsletter") },
    { href: "/about", label: t("about") },
  ];

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <SiteLogo size="lg" />

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
          <HeaderSearch />
          <LanguagePicker />

          {user ? (
            <>
              <UserAccountMenu
                user={user}
                isAdmin={isAdmin}
                labels={{
                  account: t("account"),
                  admin: t("admin"),
                  logout: t("logout"),
                }}
                onLogout={handleLogout}
              />
            </>
          ) : (
            <Link
              href="/login"
              className={`${actionButtonClass} px-4 py-2 text-sm`}
            >
              {t("login")}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <HeaderSearch />
          <LanguagePicker />
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/account/newsletter"
                  className="flex items-center gap-3 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {user.user_metadata?.avatar_url ||
                  user.user_metadata?.picture ? (
                    <img
                      src={
                        (user.user_metadata.avatar_url ??
                          user.user_metadata.picture) as string
                      }
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4C430] text-xs font-bold text-[#111111]">
                      {(user.email?.[0] ?? "?").toUpperCase()}
                    </span>
                  )}
                  {t("account")}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("admin")}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`text-left ${actionButtonClass} w-fit px-3 py-1.5 text-xs`}
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`w-fit ${actionButtonClass} px-3 py-1.5 text-xs`}
                onClick={() => setMenuOpen(false)}
              >
                {t("login")}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
