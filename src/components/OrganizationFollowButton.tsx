"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { actionButtonClass } from "@/lib/button-styles";

type Props = {
  organizationId: string;
  initialFollowing: boolean;
  initialCount: number;
  locale: string;
  userId?: string | null;
};

export function OrganizationFollowButton({
  organizationId,
  initialFollowing,
  initialCount,
  locale,
  userId,
}: Props) {
  const t = useTranslations("organizations");
  const tc = useTranslations("common");
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (!userId) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/${locale}/login?next=${encodeURIComponent(next)}`;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      const data = (await response.json()) as {
        error?: string;
        followerCount?: number;
        following?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error ?? tc("error"));
      }

      setFollowing(Boolean(data.following));
      setFollowerCount(data.followerCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={
          following
            ? "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
            : `${actionButtonClass} px-5 py-2.5 text-sm`
        }
      >
        {loading ? "…" : following ? t("followActive") : t("followCta")}
      </button>
      {followerCount > 0 && (
        <p className="mt-2 text-xs text-muted">
          {t("followCount", { count: followerCount })}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
