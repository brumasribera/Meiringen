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
      {t("addToCalendar")}
    </button>
  );
}
