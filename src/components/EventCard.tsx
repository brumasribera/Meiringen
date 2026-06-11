"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Event } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";

type Props = { event: Event };

export function EventCard({ event }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card-hover block rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="pill bg-primary/10 text-primary">
          {t(`categories.${event.category}`)}
        </span>
        {event.is_recurring && (
          <span className="pill bg-accent/20 text-foreground">
            {t("events.recurring")}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
      <p className="mt-2 text-sm text-muted">
        {formatDateRange(event.start_date, event.end_date, locale)}
      </p>
      {event.location_name && (
        <p className="mt-1 text-sm text-muted">{event.location_name}</p>
      )}
      {event.organization && (
        <p className="mt-2 text-sm font-medium text-primary-light">
          {event.organization.name}
        </p>
      )}
      {event.price && (
        <p className="mt-2 text-sm text-accent">
          {event.price === "Gratis" ? t("events.free") : event.price}
        </p>
      )}
    </Link>
  );
}
