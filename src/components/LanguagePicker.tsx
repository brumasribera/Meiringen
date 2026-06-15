"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  isLocale,
  localeCookieMaxAge,
  localeCookieName,
  locales,
} from "@/i18n/constants";

const languageOptions = {
  de: { label: "German", flag: "/flags/germany-flag.png" },
  gsw: { label: "Hasli-Tütsch", flag: "/brand/logo-mark.png" },
  en: { label: "English", flag: "/flags/england-flag.png" },
  fr: { label: "French", flag: "/flags/france-flag.png" },
  it: { label: "Italian", flag: "/flags/italy-flag.png" },
  rm: { label: "Romansh", flag: "/flags/romania-flag.png" },
  pt: { label: "Portuguese", flag: "/flags/portugal-flag.png" },
} satisfies Record<(typeof locales)[number], { label: string; flag: string }>;

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
        className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold tracking-[0.22em] text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#F4C430]/25 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Language"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Image
          src="/globe.svg"
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
          className="h-4 w-4 opacity-80"
        />
        <span>{currentLocale.toUpperCase()}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#1d2840]/95 p-1 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.75)] backdrop-blur-xl"
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === l}
              aria-label={languageOptions[l].label}
              onClick={() => {
                setOpen(false);
                void handleChange(l);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                currentLocale === l
                  ? "bg-white/10 text-white"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Image
                src={languageOptions[l].flag}
                alt=""
                aria-hidden="true"
                width={24}
                height={16}
                className={`object-cover shadow-sm ring-1 ring-black/10 ${
                  l === "gsw" ? "h-5 w-5 rounded-[0.65rem]" : "h-4 w-6 rounded-[2px]"
                }`}
              />
              <span className="flex-1">{languageOptions[l].label}</span>
              {currentLocale === l && <span className="text-base leading-none text-[#8cb4ff]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
