"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  isLocale,
  localeCookieMaxAge,
  localeCookieName,
  locales,
} from "@/i18n/constants";

function persistLocaleCookie(value: string) {
  document.cookie = `${localeCookieName}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${localeCookieMaxAge}; SameSite=Lax`;
}

export function LanguagePicker({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleChange(nextLocale: string) {
    if (!isLocale(nextLocale)) {
      return;
    }

    setSelectedLocale(nextLocale);
    setSaving(true);
    persistLocaleCookie(nextLocale);

    const supabase = createClient();
    if (supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase
            .from("profiles")
            .update({ preferred_locale: nextLocale })
            .eq("id", user.id);

          if (error) {
            console.error("Failed to save preferred locale:", error.message);
          }
        }
      } catch (error) {
        console.error("Failed to sync preferred locale:", error);
      }
    }

    window.location.reload();
  }

  const currentLocale = saving ? selectedLocale : locale;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={saving}
        className="flex min-h-10 min-w-14 items-center justify-between gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold uppercase tracking-wide text-muted shadow-sm transition hover:border-[#F4C430]/60 hover:bg-[#F4C430]/10 hover:text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F4C430]/25 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Language"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{currentLocale.toUpperCase()}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-24 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-[0_18px_45px_-24px_rgba(27,67,50,0.45)]"
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === l}
              onClick={() => {
                setOpen(false);
                void handleChange(l);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                currentLocale === l
                  ? "bg-[#F4C430] text-[#111111]"
                  : "text-foreground hover:bg-[#F4C430]/12 hover:text-[#111111]"
              }`}
            >
              <span>{l.toUpperCase()}</span>
              {currentLocale === l && <span className="text-xs font-bold">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
