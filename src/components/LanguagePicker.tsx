"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  isLocale,
  localeCookieMaxAge,
  localeCookieName,
  locales,
} from "@/i18n/constants";

export function LanguagePicker({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [saving, setSaving] = useState(false);

  function persistLocaleCookie(value: string) {
    document.cookie = `${localeCookieName}=${encodeURIComponent(
      value,
    )}; path=/; max-age=${localeCookieMaxAge}; SameSite=Lax`;
  }

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

  return (
    <label
      className={`group inline-flex cursor-pointer items-center rounded-full px-1.5 py-0.5 transition hover:bg-[#F4C430]/25 ${className}`}
    >
      <select
        value={saving ? selectedLocale : locale}
        onChange={(e) => void handleChange(e.target.value)}
        disabled={saving}
        className="w-[2.25rem] cursor-pointer appearance-none border-0 bg-transparent text-center text-[11px] font-bold uppercase tracking-wide text-muted outline-none group-hover:text-[#111111]"
        aria-label="Language"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
