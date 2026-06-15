"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CONTENT_LANGUAGES, EVENT_CATEGORIES } from "@/lib/constants";
import type { Organization } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { OrganizationSearchSelect } from "@/components/OrganizationSearchSelect";
import { selectControlClass } from "@/lib/form-styles";

type Props = {
  organizations: Organization[];
};

export function EventFilters({ organizations }: Props) {
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

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("events.search")}
        </label>
        <input
          type="search"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          className={selectControlClass}
          placeholder={t("events.search")}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("events.category")}
        </label>
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
          className={selectControlClass}
        >
          <option value="">{t("events.all")}</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`categories.${c}`)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("events.language")}
        </label>
        <select
          value={searchParams.get("language") ?? ""}
          onChange={(e) => update("language", e.target.value)}
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
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("events.organization")}
        </label>
        <OrganizationSearchSelect
          organizations={organizations}
          value={searchParams.get("organization") ?? ""}
          onChange={(organizationId) => update("organization", organizationId)}
          allLabel={t("events.all")}
          id="event-org-search"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("events.dateFrom")}
        </label>
        <input
          type="date"
          defaultValue={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => update("dateFrom", e.target.value)}
          className={selectControlClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          {t("events.dateTo")}
        </label>
        <input
          type="date"
          defaultValue={searchParams.get("dateTo") ?? ""}
          onChange={(e) => update("dateTo", e.target.value)}
          className={selectControlClass}
        />
      </div>
    </div>
  );
}
