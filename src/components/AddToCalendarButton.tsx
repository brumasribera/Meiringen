"use client";

import { useTranslations } from "next-intl";

type Props = {
  calendarUrl: string;
  locale: string;
  isSignedIn: boolean;
  className?: string;
};

export function AddToCalendarButton({
  calendarUrl,
  locale,
  isSignedIn,
  className = "",
}: Props) {
  const t = useTranslations("events");

  function handleClick() {
    if (isSignedIn) {
      window.open(calendarUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const next = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/${locale}/login?mode=signup&next=${encodeURIComponent(next)}`;
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 2v3M17 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
        <path d="M12 12v6M9 15h6" />
      </svg>
      {t("addToCalendar")}
    </button>
  );
}
