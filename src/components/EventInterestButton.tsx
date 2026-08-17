"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { actionButtonClass } from "@/lib/button-styles";

type Props = {
  eventId: string;
  initialInterested: boolean;
  initialCount: number;
  locale: string;
  userId?: string | null;
};

export function EventInterestButton({
  eventId,
  initialInterested,
  initialCount,
  locale,
  userId,
}: Props) {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const [interested, setInterested] = useState(initialInterested);
  const [interestCount, setInterestCount] = useState(initialCount);
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
      const response = await fetch(`/api/events/${eventId}/interest`, {
        method: interested ? "DELETE" : "POST",
      });
      const data = (await response.json()) as {
        error?: string;
        interestCount?: number;
        interested?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error ?? tc("error"));
      }

      setInterested(Boolean(data.interested));
      setInterestCount(data.interestCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={
          interested
            ? "inline-flex min-w-[10.5rem] items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
            : `${actionButtonClass} inline-flex min-w-[10.5rem] items-center justify-center px-5 py-2.5 text-sm`
        }
      >
        {loading ? "…" : interested ? t("interestActive") : t("interestCta")}
      </button>
      {interestCount > 0 && (
        <span
          aria-label={t("interestCount", { count: interestCount })}
          title={t("interestCount", { count: interestCount })}
          className="absolute -right-1 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-card bg-[#111111] px-1 text-[0.65rem] font-bold leading-none text-white"
        >
          {interestCount}
        </span>
      )}
      {error && (
        <p className="absolute left-0 top-full z-10 mt-2 whitespace-nowrap rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 shadow-sm">
          {error}
        </p>
      )}
    </div>
  );
}
