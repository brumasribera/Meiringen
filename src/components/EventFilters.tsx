"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CONTENT_LANGUAGES, EVENT_CATEGORIES } from "@/lib/constants";
import type { EventCategory } from "@/lib/constants";
import type { Organization } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { OrganizationSearchSelect } from "@/components/OrganizationSearchSelect";
import { selectControlClass } from "@/lib/form-styles";

type Props = {
  organizations: Organization[];
};

function parseCategories(value: string | null): EventCategory[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry): entry is EventCategory =>
      EVENT_CATEGORIES.includes(entry as EventCategory)
    );
}

export function EventFilters({ organizations }: Props) {
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

  function toggleCategory(category: EventCategory) {
    const nextCategories = categories.includes(category)
      ? categories.filter((item) => item !== category)
      : [...categories, category];
    update({
      categories: nextCategories.length > 0 ? nextCategories.join(",") : null,
      category: null,
    });
  }

  const clearCategories = () => update({ categories: null, category: null });
  const hasAdvancedFilters =
    Boolean(searchParams.get("language")) ||
    Boolean(searchParams.get("organization")) ||
    Boolean(searchParams.get("dateFrom")) ||
    Boolean(searchParams.get("dateTo"));
  const [advancedOpen, setAdvancedOpen] = useState(hasAdvancedFilters);

  return (
    <div className="rounded-3xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-end">
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted">
            {t("events.search")}
          </label>
          <input
            type="search"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => update({ search: e.target.value || null })}
            className={selectControlClass}
            placeholder={t("events.search")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              advancedOpen || hasAdvancedFilters
                ? "border-primary/25 bg-primary/10 text-primary shadow-sm"
                : "border-border bg-white/70 text-muted hover:border-primary/30 hover:text-foreground"
            }`}
            aria-expanded={advancedOpen}
            aria-controls="event-filters-advanced"
          >
            {advancedOpen ? t("events.alertHideCustomize") : t("events.alertFullForm")}
          </button>
          <a
            href="#event-alert-signup"
            className="rounded-full bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#F4C430] transition hover:bg-[#111111]/90 focus:outline-none focus:ring-2 focus:ring-[#111111]/20"
          >
            {t("alertSubscribe")}
          </a>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="mr-1 text-xs font-medium uppercase tracking-wide text-muted">
          {t("events.category")}
        </div>
        <button
          type="button"
          onClick={clearCategories}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            categories.length === 0
              ? "border-primary/25 bg-primary text-white shadow-sm"
              : "border-border bg-white/70 text-muted hover:border-primary/30 hover:text-foreground"
          }`}
          aria-pressed={categories.length === 0}
        >
          {t("events.all")}
        </button>
        {EVENT_CATEGORIES.map((category) => {
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

      <div
        id="event-filters-advanced"
        className={`grid overflow-hidden transition-all duration-200 ${
          advancedOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                {t("events.language")}
              </label>
              <select
                value={searchParams.get("language") ?? ""}
                onChange={(e) => update({ language: e.target.value || null })}
                className={selectControlClass}
              >
                <option value="">{t("events.all")}</option>
                {CONTENT_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {t(`languages.${l}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                {t("events.organization")}
              </label>
              <OrganizationSearchSelect
                organizations={organizations}
                value={searchParams.get("organization") ?? ""}
                onChange={(organizationId) => update({ organization: organizationId || null })}
                allLabel={t("events.all")}
                id="event-org-search"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                {t("events.dateFrom")}
              </label>
              <input
                type="date"
                defaultValue={searchParams.get("dateFrom") ?? ""}
                onChange={(e) => update({ dateFrom: e.target.value || null })}
                className={selectControlClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                {t("events.dateTo")}
              </label>
              <input
                type="date"
                defaultValue={searchParams.get("dateTo") ?? ""}
                onChange={(e) => update({ dateTo: e.target.value || null })}
                className={selectControlClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
