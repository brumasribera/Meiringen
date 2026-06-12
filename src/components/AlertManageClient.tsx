"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertPreferencesForm } from "@/components/AlertPreferencesForm";
import type { AlertPreferencesState } from "@/components/AlertPreferencesForm";

type Props = {
  token: string;
};

export function AlertManageClient({ token }: Props) {
  const t = useTranslations("alerts");
  const [initial, setInitial] = useState<Partial<AlertPreferencesState> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/alerts/manage?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Not found");
        return response.json();
      })
      .then((data) => {
        setInitial({
          email: data.email,
          frequency: data.frequency,
          categories: data.categories,
          languages: data.languages,
          organization_ids: data.organization_ids,
        });
      })
      .catch(() => setError(t("invalidToken")));
  }, [token, t]);

  if (error) {
    return <p className="text-muted">{error}</p>;
  }

  if (!initial) {
    return (
      <div className="h-40 animate-pulse rounded-2xl bg-border" aria-hidden />
    );
  }

  return (
    <AlertPreferencesForm
      initial={initial}
      manageToken={token}
      emailReadOnly
      showUnsubscribe
    />
  );
}
