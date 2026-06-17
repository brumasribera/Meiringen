"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { OrgLogo } from "@/components/OrgLogo";
import type { Event } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";

type Props = { event: Event };

export function EventCard({ event }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card-hover block rounded-2xl border border-border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
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
        <div className="mt-3 flex items-center gap-3">
          <OrgLogo
            name={event.organization.name}
            imageUrl={event.organization.image_url}
            websiteUrl={event.organization.website_url}
            locality={event.organization.locality}
            size="sm"
          />
          <p className="min-w-0 text-sm font-medium text-primary-light">
            {event.organization.name}
          </p>
        </div>
      )}
      {event.price && (
        <p className="mt-2 text-sm text-accent">
          {event.price === "Gratis" ? t("events.free") : event.price}
        </p>
      )}
    </Link>
  );
}
