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
      className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        {event.organization ? (
          <div className="flex items-center gap-2 min-w-0">
            <OrgLogo
              name={event.organization.name}
              imageUrl={event.organization.image_url}
              websiteUrl={event.organization.website_url}
              locality={event.organization.locality}
              size="sm"
              shape="square"
            />
            <p className="min-w-0 line-clamp-1 text-sm font-medium text-foreground">
              {event.organization.name}
            </p>
          </div>
        ) : (
          <span className="pill bg-primary/10 text-primary">
            {t(`categories.${event.category}`)}
          </span>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <span className="pill bg-primary/10 text-primary">
            {t(`categories.${event.category}`)}
          </span>
          {event.is_recurring && (
            <span className="pill bg-accent/20 text-foreground">
              {t("events.recurring")}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex min-h-[7rem] flex-1 flex-col">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">
          {event.title}
        </h3>
        <p className="mt-2 text-sm text-muted" suppressHydrationWarning>
          {formatDateRange(event.start_date, event.end_date, locale)}
        </p>
        {event.location_name && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {event.location_name}
          </p>
        )}
      </div>
      {event.price && (
        <p className="mt-4 text-sm text-accent">
          {event.price === "Gratis" ? t("events.free") : event.price}
        </p>
      )}
    </Link>
  );
}
