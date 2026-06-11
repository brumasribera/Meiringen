"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/constants";
import { useSearchParams } from "next/navigation";

export function OrganizationFilters() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm";

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("organizations.search")}
        </label>
        <input
          type="search"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("organizations.category")}
        </label>
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
          className={inputClass}
        >
          <option value="">{t("events.all")}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`categories.${c}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
