"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CONTENT_LANGUAGES } from "@/lib/constants";
import type { Organization } from "@/lib/types";
import type { NewsletterPreferences } from "@/lib/types";

type Props = {
  userId: string;
  preferences: NewsletterPreferences | null;
  organizations: Organization[];
};

export function NewsletterForm({ userId, preferences, organizations }: Props) {
  const t = useTranslations("newsletter");
  const tc = useTranslations("categories");
  const [categories, setCategories] = useState<string[]>(
    preferences?.categories ?? []
  );
  const [organizationIds, setOrganizationIds] = useState<string[]>(
    preferences?.organization_ids ?? []
  );
  const [languages, setLanguages] = useState<string[]>(
    preferences?.languages ?? ["de"]
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggle(arr: string[], value: string, setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const payload = {
      user_id: userId,
      frequency: "monthly" as const,
      categories,
      organization_ids: organizationIds,
      languages,
    };

    if (preferences) {
      await supabase
        .from("newsletter_preferences")
        .update(payload)
        .eq("user_id", userId);
    } else {
      await supabase.from("newsletter_preferences").insert(payload);
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <fieldset>
        <legend className="font-semibold">{t("categories")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
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

      <fieldset>
        <legend className="font-semibold">{t("organizations")}</legend>
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border p-4">
          {organizations.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={organizationIds.includes(o.id)}
                onChange={() => toggle(organizationIds, o.id, setOrganizationIds)}
              />
              {o.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">{t("languages")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTENT_LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => toggle(languages, l, setLanguages)}
              className={`pill transition ${
                languages.includes(l)
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-light disabled:opacity-50"
      >
        {saved ? t("saved") : t("save")}
      </button>
    </form>
  );
}
