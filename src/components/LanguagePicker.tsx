"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  type Locale,
  isLocale,
  localeCookieMaxAge,
  localeCookieName,
  locales,
} from "@/i18n/constants";

const languageOptions = {
  de: { flag: "/flags/de.svg" },
  gsw: { flag: "/flags/hasli-flag.png" },
  en: { flag: "/flags/en.svg" },
  es: { flag: "/flags/spain-new-flag.png" },
  ca: { flag: "/flags/catalan-flag.png" },
  fr: { flag: "/flags/fr.svg" },
  it: { flag: "/flags/it.svg" },
  rm: { flag: "/flags/romansch-flag.png" },
  pt: { flag: "/flags/pt.svg" },
} satisfies Record<(typeof locales)[number], { flag: string }>;

function persistLocaleCookie(value: string) {
  document.cookie = `${localeCookieName}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${localeCookieMaxAge}; SameSite=Lax`;
}

export function LanguagePicker({ className = "" }: { className?: string }) {
  return <LanguagePickerBase className={className} />;
}

type PickerProps = {
  className?: string;
  variant?: "dark" | "light";
  value?: Locale;
  onChange?: (value: Locale) => void;
};

export function LanguagePickerField({
  className = "",
  variant = "light",
  value,
  onChange,
}: PickerProps) {
  return (
    <LanguagePickerBase
      className={className}
      variant={variant}
      value={value}
      onChange={onChange}
    />
  );
}

function LanguagePickerBase({
  className = "",
  variant = "dark",
  value,
  onChange,
}: PickerProps) {
  const locale = useLocale();
  const tLanguages = useTranslations("languages");
  const tCommon = useTranslations("common");
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
    onChange?.(nextLocale);

    if (value !== undefined) {
      setOpen(false);
      return;
    }

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

  const currentLocale =
    value ?? (saving ? selectedLocale : locale);
  const buttonClass =
    variant === "light"
      ? "inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 text-left text-sm text-foreground shadow-sm transition hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-[#F4C430]/25"
      : "inline-flex min-h-10 items-center justify-center rounded-full px-2 py-1 text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#F4C430]/25 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={saving}
        className={buttonClass}
        aria-label={tCommon("language")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {variant === "light" ? (
          <>
            <span className="flex items-center gap-3">
              <LanguageFlag locale={currentLocale} />
              <span className="font-medium">{tLanguages(currentLocale)}</span>
            </span>
            <Image
              src="/globe.svg"
              alt=""
              aria-hidden="true"
              width={16}
              height={16}
              loading="lazy"
              className="h-4 w-4 opacity-60"
            />
          </>
        ) : (
          <Image
            src="/globe.svg"
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            loading="lazy"
            className="h-4 w-4 opacity-80"
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 min-w-52 overflow-hidden rounded-2xl p-1 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.75)] backdrop-blur-xl ${
            variant === "light"
              ? "left-0 border border-border bg-white/95"
              : "right-0 border border-white/10 bg-[#1d2840]/95"
          }`}
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === l}
              aria-label={tLanguages(l)}
              onClick={() => {
                setOpen(false);
                void handleChange(l);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                variant === "light"
                  ? currentLocale === l
                    ? "bg-[#F4C430]/15 text-[#111111]"
                    : "text-foreground hover:bg-[#F4C430]/10"
                  : currentLocale === l
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LanguageFlag locale={l} />
              <span className="flex-1">{tLanguages(l)}</span>
              {currentLocale === l && (
                <span
                  className={`text-base leading-none ${
                    variant === "light" ? "text-primary" : "text-[#8cb4ff]"
                  }`}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguageFlag({ locale }: { locale: string }) {
  if (!isLocale(locale)) {
    return null;
  }

  if (locale === "gsw") {
    return (
      <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-[2px] bg-[#ffd400] shadow-sm ring-1 ring-black/10">
        <Image
          src={languageOptions[locale].flag}
          alt=""
          aria-hidden="true"
          width={48}
          height={32}
          loading="eager"
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  if (locale === "rm") {
    return (
      <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-[2px] bg-white shadow-sm ring-1 ring-black/10">
        <Image
          src={languageOptions[locale].flag}
          alt=""
          aria-hidden="true"
          width={48}
          height={32}
          loading="eager"
          className="h-full w-full object-cover object-center"
        />
      </span>
    );
  }

  return (
    <Image
      src={languageOptions[locale].flag}
      alt=""
      aria-hidden="true"
      width={48}
      height={32}
      loading="eager"
      className="h-4 w-6 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10"
    />
  );
}
