"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { OrganizationCategory } from "@/lib/constants";
import { LOCALITIES, ORGANIZATION_CATEGORIES } from "@/lib/constants";
import { useSearchParams } from "next/navigation";
import { selectControlClass } from "@/lib/form-styles";

function parseCategories(value: string | null): OrganizationCategory[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry): entry is OrganizationCategory =>
      ORGANIZATION_CATEGORIES.includes(entry as OrganizationCategory)
    );
}

export function OrganizationFilters() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categories = useMemo(
    () => parseCategories(searchParams.get("categories") ?? searchParams.get("category")),
    [searchParams]
  );

  function update(paramsToSet: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(paramsToSet)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleCategory(category: OrganizationCategory) {
    const nextCategories = categories.includes(category)
      ? categories.filter((item) => item !== category)
      : [...categories, category];
    update({
      categories: nextCategories.length > 0 ? nextCategories.join(",") : null,
      category: null,
    });
  }

  const clearAll = () => {
    update({ search: null, locality: null, categories: null, category: null });
  };

  return (
    <div className="rounded-3xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]">
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted">
            {t("organizations.search")}
          </label>
          <input
            type="search"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => update({ search: e.target.value || null })}
            className={selectControlClass}
            placeholder={t("organizations.search")}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted">
            {t("organizations.locality")}
          </label>
          <select
            value={searchParams.get("locality") ?? ""}
            onChange={(e) => update({ locality: e.target.value || null })}
            className={selectControlClass}
          >
            <option value="">{t("events.all")}</option>
            {LOCALITIES.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {t(`localities.${locality.id}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="mr-1 text-xs font-medium uppercase tracking-wide text-muted">
          {t("organizations.category")}
        </div>
        <button
          type="button"
          onClick={clearAll}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            categories.length === 0
              ? "border-primary/25 bg-primary text-white shadow-sm"
              : "border-border bg-white/70 text-muted hover:border-primary/30 hover:text-foreground"
          }`}
          aria-pressed={categories.length === 0}
        >
          {t("events.all")}
        </button>
        {ORGANIZATION_CATEGORIES.map((category) => {
          const active = categories.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                active
                  ? "border-primary/25 bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-white/70 text-muted hover:border-primary/30 hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              {t(`categories.${category}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
