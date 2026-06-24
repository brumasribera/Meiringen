"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { actionButtonClass } from "@/lib/button-styles";
import { EVENT_CATEGORIES } from "@/lib/constants";
import type { AlertFrequency } from "@/lib/constants";
import type { Organization } from "@/lib/types";
import { OrganizationPicker } from "@/components/OrganizationPicker";
import { LanguagePickerField } from "@/components/LanguagePicker";
import { defaultLocale, isLocale, type Locale } from "@/i18n/constants";

export type AlertPreferencesState = {
  email: string;
  frequency: AlertFrequency;
  categories: string[];
  languages: string[];
  organization_ids?: string[];
};

type Props = {
  initial?: Partial<AlertPreferencesState>;
  organizations?: Organization[];
  manageToken?: string;
  userId?: string;
  emailReadOnly?: boolean;
  showOrganizations?: boolean;
  showUnsubscribe?: boolean;
  onSaved?: () => void;
};

export function AlertPreferencesForm({
  initial,
  organizations = [],
  manageToken,
  userId,
  emailReadOnly = false,
  showOrganizations = false,
  showUnsubscribe = false,
  onSaved,
}: Props) {
  const t = useTranslations("alerts");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const [email, setEmail] = useState(initial?.email ?? "");
  const [frequency, setFrequency] = useState<AlertFrequency>(
    initial?.frequency ?? "weekly"
  );
  const [categories, setCategories] = useState<string[]>(
    initial?.categories ?? []
  );
  const [organizationIds, setOrganizationIds] = useState<string[]>(
    initial?.organization_ids ?? []
  );
  const [language, setLanguage] = useState<Locale>(() => {
    const initialLanguage = initial?.languages?.[0];
    if (initialLanguage && isLocale(initialLanguage)) {
      return initialLanguage;
    }
    return isLocale(locale) ? locale : defaultLocale;
  });
  const [saved, setSaved] = useState(false);
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(arr: string[], value: string, setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (manageToken) {
        const response = await fetch(
          `/api/alerts/manage?token=${encodeURIComponent(manageToken)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              frequency,
              categories,
              languages: [language],
              locale,
              active: true,
              organization_ids: organizationIds,
            }),
          }
        );
        if (!response.ok) throw new Error(await response.text());
      } else {
        const response = await fetch("/api/alerts/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            frequency,
            categories,
            languages: [language],
            locale,
            userId,
            organizationIds,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? t("error"));
        setManageUrl(data.manageUrl ?? null);
        setEmailSent(Boolean(data.emailSent));
      }

      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    if (!manageToken) return;
    if (!confirm(t("unsubscribeConfirm"))) return;
    window.location.href = `/api/alerts/manage?token=${encodeURIComponent(manageToken)}&action=unsubscribe`;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("email")}</label>
        <input
          type="email"
          required
          value={email}
          readOnly={emailReadOnly}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm disabled:opacity-70"
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <fieldset>
        <legend className="font-semibold">{t("frequency")}</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {(["weekly", "monthly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFrequency(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                frequency === value
                  ? "bg-[#111111] text-white"
                  : "bg-[#F4C430]/30 text-[#111111]"
              }`}
            >
              {t(`frequency_${value}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">{t("categories")}</legend>
        <p className="mt-1 text-sm text-muted">{t("categoriesHint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(categories, c, setCategories)}
              className={`pill transition ${
                categories.includes(c)
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {tc(c)}
            </button>
          ))}
        </div>
      </fieldset>

      {showOrganizations && organizations.length > 0 && (
        <fieldset>
          <legend className="font-semibold">{t("organizations")}</legend>
          <OrganizationPicker
            id="alert-org-search"
            organizations={organizations}
            selectedIds={organizationIds}
            onChange={setOrganizationIds}
          />
        </fieldset>
      )}

      <fieldset>
        <legend className="font-semibold">{t("emailLanguage")}</legend>
        <div className="mt-3">
          <LanguagePickerField value={language} onChange={setLanguage} />
        </div>
      </fieldset>

      {saved && (
        <div className="rounded-xl border border-[#F4C430] bg-[#F4C430]/15 p-4 text-sm">
          <p className="font-medium text-[#111111]">
            {emailSent ? t("savedWithEmail") : t("savedNoEmail")}
          </p>
          {manageUrl && !emailSent && (
            <Link
              href={manageUrl}
              className="mt-1 inline-block font-medium text-[#111111] underline-offset-4 hover:underline"
            >
              {t("manageLink")}
            </Link>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`${actionButtonClass} px-8 py-3`}
        >
          {saved ? t("saved") : t("save")}
        </button>
        {showUnsubscribe && manageToken && (
          <button
            type="button"
            onClick={handleUnsubscribe}
            className="text-sm text-muted underline-offset-4 hover:underline"
          >
            {t("unsubscribe")}
          </button>
        )}
      </div>
    </form>
  );
}
