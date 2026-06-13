"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { actionButtonClass } from "@/lib/button-styles";
import { CATEGORIES, CONTENT_LANGUAGES } from "@/lib/constants";
import type {
  AlertFrequency,
  Category,
  ContentLanguage,
} from "@/lib/constants";
import type { Organization } from "@/lib/types";
import { OrganizationSearchSelect } from "@/components/OrganizationSearchSelect";

type Props = {
  organizations: Organization[];
};

function filtersFromParams(
  params: URLSearchParams,
  locale: string,
): {
  categories: Category[];
  languages: ContentLanguage[];
  organizationIds: string[];
} {
  const category = params.get("category");
  const language = params.get("language");
  const organization = params.get("organization");

  return {
    categories:
      category && CATEGORIES.includes(category as Category)
        ? [category as Category]
        : [],
    languages:
      language && CONTENT_LANGUAGES.includes(language as ContentLanguage)
        ? [language as ContentLanguage]
        : [locale as ContentLanguage],
    organizationIds: organization ? [organization] : [],
  };
}

export function EventAlertSignup({ organizations }: Props) {
  const t = useTranslations("events");
  const ta = useTranslations("alerts");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const urlFilters = useMemo(
    () => filtersFromParams(searchParams, locale),
    [searchParams, locale],
  );

  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<AlertFrequency>("weekly");
  const [categories, setCategories] = useState<Category[]>(
    urlFilters.categories,
  );
  const [languages, setLanguages] = useState<ContentLanguage[]>(
    urlFilters.languages,
  );
  const [organizationIds, setOrganizationIds] = useState<string[]>(
    urlFilters.organizationIds,
  );
  const [customize, setCustomize] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    manageUrl: string;
    emailSent: boolean;
  } | null>(null);

  useEffect(() => {
    setCategories(urlFilters.categories);
    setLanguages(urlFilters.languages);
    setOrganizationIds(urlFilters.organizationIds);
    setSuccess(null);
  }, [urlFilters]);

  const hasCalendarFilters = Boolean(
    searchParams.get("search") ||
    searchParams.get("dateFrom") ||
    searchParams.get("dateTo"),
  );

  const hasAlertFilters =
    categories.length > 0 ||
    organizationIds.length > 0 ||
    languages.length !== 1 ||
    !languages.includes(locale as ContentLanguage);

  function toggle<T extends string>(
    arr: T[],
    value: T,
    setter: (v: T[]) => void,
  ) {
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          frequency,
          categories,
          languages,
          organizationIds,
          locale,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? ta("error"));

      setSuccess({
        manageUrl: data.manageUrl ?? data.manageUrlFull,
        emailSent: Boolean(data.emailSent),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : ta("error"));
    } finally {
      setLoading(false);
    }
  }

  function resetToUrlFilters() {
    setCategories(urlFilters.categories);
    setLanguages(urlFilters.languages);
    setOrganizationIds(urlFilters.organizationIds);
  }

  const orgName = organizationIds
    .map((id) => organizations.find((o) => o.id === id)?.name)
    .filter(Boolean);

  const alertPageHref =
    organizationIds.length > 0
      ? `/alerts?organization=${encodeURIComponent(organizationIds[0])}`
      : "/alerts";

  if (success) {
    return (
      <div className="mt-4 rounded-2xl border border-[#F4C430] bg-[#F4C430]/15 p-5">
        <p className="font-semibold text-[#111111]">
          {success.emailSent ? ta("savedWithEmail") : ta("savedNoEmail")}
        </p>
        <Link
          href={
            success.manageUrl.startsWith("/") ? success.manageUrl : "/alerts"
          }
          className="mt-2 inline-block text-sm font-medium text-[#111111] underline-offset-4 hover:underline"
        >
          {ta("manageLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-[#F4C430] bg-[#F4C430]/10 p-5">
      <h2 className="text-lg font-bold text-[#111111]">{t("alertTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("alertSubtitle")}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.length === 0 && organizationIds.length === 0 ? (
          <span className="rounded-full bg-[#111111] px-3 py-1 text-xs font-medium text-[#F4C430]">
            {t("alertAllCategories")}
          </span>
        ) : (
          <>
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-full bg-[#111111] px-3 py-1 text-xs font-medium text-[#F4C430]"
              >
                {tc(c)}
              </span>
            ))}
            {orgName.map((name) => (
              <span
                key={name}
                className="rounded-full bg-[#111111]/80 px-3 py-1 text-xs font-medium text-[#F4C430]"
              >
                {name}
              </span>
            ))}
          </>
        )}
        {languages.map((l) => (
          <span
            key={l}
            className="rounded-full border border-[#111111] px-3 py-1 text-xs font-medium text-[#111111]"
          >
            {l.toUpperCase()}
          </span>
        ))}
      </div>

      {hasCalendarFilters && (
        <p className="mt-2 text-xs text-muted">{t("alertDateNote")}</p>
      )}

      <form onSubmit={handleSubscribe} className="mt-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">
              {ta("email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ta("emailPlaceholder")}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(["weekly", "monthly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFrequency(value)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium ${
                  frequency === value
                    ? "bg-[#111111] text-[#F4C430]"
                    : "bg-[#F4C430] text-[#111111]"
                }`}
              >
                {ta(`frequency_${value}`)}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`${actionButtonClass} px-6 py-2.5 text-sm`}
          >
            {loading ? "…" : t("alertSubscribe")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCustomize((v) => !v)}
            className="text-sm font-medium text-[#111111] underline-offset-4 hover:underline"
          >
            {customize ? t("alertHideCustomize") : t("alertCustomize")}
          </button>
          {customize && hasAlertFilters && (
            <button
              type="button"
              onClick={resetToUrlFilters}
              className="text-sm text-muted underline-offset-4 hover:underline"
            >
              {t("alertResetFilters")}
            </button>
          )}
          <Link
            href={alertPageHref}
            className="text-sm text-muted hover:text-[#111111]"
          >
            {t("alertFullForm")}
          </Link>
        </div>

        {customize && (
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-xs font-medium text-muted">
                {ta("categories")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggle(categories, c, setCategories)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      categories.includes(c)
                        ? "bg-[#111111] text-[#F4C430]"
                        : "bg-[#F4C430]/40 text-[#111111]"
                    }`}
                  >
                    {tc(c)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">
                {ta("organizations")}
              </p>
              <div className="mt-2">
                <OrganizationSearchSelect
                  organizations={organizations}
                  value={organizationIds[0] ?? ""}
                  onChange={(organizationId) =>
                    setOrganizationIds(organizationId ? [organizationId] : [])
                  }
                  allLabel={t("all")}
                  id="event-alert-org-search"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">
                {ta("languages")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONTENT_LANGUAGES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggle(languages, l, setLanguages)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      languages.includes(l)
                        ? "bg-[#111111] text-[#F4C430]"
                        : "bg-[#F4C430]/40 text-[#111111]"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
