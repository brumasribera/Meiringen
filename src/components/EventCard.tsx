"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { OrgLogo } from "@/components/OrgLogo";
import { cleanEventTitle } from "@/lib/event-title";
import type { Event } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";

type Props = { event: Event };

export function EventCard({ event }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const eventTitle = cleanEventTitle(event.title, event.organization?.name);
  const isFree = event.price?.trim().toLowerCase() === "gratis";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card-hover group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="pill bg-primary/10 text-primary">
          {t(`categories.${event.category}`)}
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          {isFree && (
            <span className="pill bg-accent/20 text-foreground">
              {t("events.free")}
            </span>
          )}
          {event.is_recurring && (
            <span className="pill bg-muted/70 text-muted-foreground">
              {t("events.recurring")}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        {event.organization ? (
          <div className="flex min-w-0 items-center gap-2">
            <div className="rounded-lg bg-white shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
              <OrgLogo
                name={event.organization.name}
                imageUrl={event.organization.image_url}
                websiteUrl={event.organization.website_url}
                locality={event.organization.locality}
                size="sm"
                shape="square"
              />
            </div>
            <p className="min-w-0 line-clamp-1 text-sm font-medium text-foreground">
              {event.organization.name}
            </p>
          </div>
        ) : null}
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-foreground">
          {eventTitle}
        </h3>
        <div className="mt-3 space-y-1.5 text-sm text-muted">
          <p suppressHydrationWarning>{formatDateRange(event.start_date, event.end_date, locale)}</p>
          {event.location_name && (
            <p className="line-clamp-2">{event.location_name}</p>
          )}
          {event.address && !event.location_name && (
            <p className="line-clamp-2">{event.address}</p>
          )}
        </div>
        {event.price && !isFree && (
          <p className="mt-3 text-sm font-medium text-accent">
            {event.price}
          </p>
        )}
      </div>
      <div className="mt-5 pt-4">
        <span className="text-sm font-medium text-primary transition-colors group-hover:underline">
          Learn more
        </span>
      </div>
    </Link>
  );
}
