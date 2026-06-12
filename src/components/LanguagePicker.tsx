"use client";

import { useLocale } from "next-intl";
import { usePathname, locales } from "@/i18n/routing";

export function LanguagePicker({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <label
      className={`group inline-flex cursor-pointer items-center rounded-full px-1.5 py-0.5 transition hover:bg-[#F4C430]/25 ${className}`}
    >
      <select
        value={locale}
        onChange={(e) => {
          window.location.href = `/${e.target.value}${pathname}`;
        }}
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

export const authButtonClass =
  "rounded-full bg-[#111111] px-4 py-2 text-sm font-semibold text-[#F4C430] transition hover:bg-[#333333]";
