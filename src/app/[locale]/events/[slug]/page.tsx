import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getEventBySlug,
  getEventInterestSummary,
  getRelatedEventsForEvent,
} from "@/lib/data";
import {
  buildAlertHref,
  buildGoogleMapsUrl,
  formatDateRange,
} from "@/lib/utils";
import { MapLoader } from "@/components/MapLoader";
import { ShareButton } from "@/components/ShareButton";
import { actionButtonClass } from "@/lib/button-styles";
import { EventCard } from "@/components/EventCard";
import { EventInterestButton } from "@/components/EventInterestButton";
import { createClient } from "@/lib/supabase/server";
import { OrgCoverArt } from "@/components/OrgCoverArt";
import { OrgLogoImageViewer } from "@/components/OrgLogoImageViewer";
import { resolveOrgCoverImageUrl } from "@/lib/org-content";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const event = await getEventBySlug(slug);

  if (!event || event.status !== "published") notFound();

  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const hasCoords = event.latitude && event.longitude;
  const alertHref = buildAlertHref({
    category: event.category,
    language: event.language,
    organizationId: event.organization_id,
  });
  const mapsHref = buildGoogleMapsUrl({
    query: [event.location_name, event.address].filter(Boolean).join(", "),
    latitude: event.latitude,
    longitude: event.longitude,
  });
  const coverImageUrl = event.organization
    ? resolveOrgCoverImageUrl(
        event.organization.cover_image_url,
        event.organization.image_url
      )
    : null;
  const [interestSummary, relatedEvents] = await Promise.all([
    getEventInterestSummary(event.id, user?.id),
    getRelatedEventsForEvent(event, 3),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/events" className="text-sm text-primary hover:underline">
        ← {t("common.back")}
      </Link>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        {event.organization && (
          <div className="relative min-h-[14rem] overflow-hidden">
            <OrgCoverArt
              category={event.organization.category}
              coverImageUrl={coverImageUrl}
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
              <div className="max-w-2xl">
                <div className="flex flex-wrap gap-2">
                  <span className="pill border border-white/30 bg-white/15 text-white backdrop-blur-sm">
                    {t(`categories.${event.category}`)}
                  </span>
                  {event.language && (
                    <span className="pill border border-white/30 bg-white/15 text-white backdrop-blur-sm">
                      {t(`languages.${event.language}`)}
                    </span>
                  )}
                  {event.is_recurring && (
                    <span className="pill border border-white/30 bg-white/15 text-white backdrop-blur-sm">
                      {t("events.recurring")}
                    </span>
                  )}
                </div>
                <h1 className="mt-4 text-3xl font-bold md:text-4xl">
                  {event.title}
                </h1>
                <p className="mt-4 text-lg text-white/85">
                  {formatDateRange(event.start_date, event.end_date, locale)}
                </p>
              </div>
            </div>
          </div>
        )}
        {!event.organization && (
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              <span className="pill bg-primary/10 text-primary">
                {t(`categories.${event.category}`)}
              </span>
              {event.language && (
                <span className="pill bg-accent/20 text-foreground">
                  {t(`languages.${event.language}`)}
                </span>
              )}
              {event.is_recurring && (
                <span className="pill bg-accent/20 text-foreground">
                  {t("events.recurring")}
                </span>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl">
              {event.title}
            </h1>
            <p className="mt-4 text-lg text-muted">
              {formatDateRange(event.start_date, event.end_date, locale)}
            </p>
          </div>
        )}

        {event.organization && (
          <div className="border-t border-border bg-card p-6">
            <Link
              href={`/organizations/${event.organization.slug}`}
              className="inline-flex items-center gap-3 font-medium text-primary hover:underline"
            >
              <OrgLogoImageViewer
                name={event.organization.name}
                imageUrl={event.organization.image_url}
                websiteUrl={event.organization.website_url}
                locality={event.organization.locality}
                size="sm"
                shape="square"
              />
              <span className="text-base">{event.organization.name}</span>
            </Link>
          </div>
        )}
      </section>

      {event.location_name && (
        <p className="mt-4 text-muted">
          <strong>{event.location_name}</strong>
          {event.address && <> — {event.address}</>}
        </p>
      )}

      {event.price && (
        <p className="mt-2 font-medium text-accent">
          {event.price === "Gratis" ? t("events.free") : event.price}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{t("events.connectTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("events.connectSubtitle")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <EventInterestButton
            eventId={event.id}
            initialInterested={interestSummary.isInterested}
            initialCount={interestSummary.interestCount}
            locale={locale}
            userId={user?.id}
          />
          <Link href={alertHref} className={`${actionButtonClass} px-5 py-2.5 text-sm`}>
            {t("events.getAlertsForThis")}
          </Link>
          {event.organization && (
            <Link
              href={`/organizations/${event.organization.slug}`}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {t("events.visitOrganizer")}
            </Link>
          )}
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {t("events.openInMaps")}
            </a>
          )}
          <ShareButton
            title={event.title}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
          />
        </div>
      </section>

      {event.description && (
        <div className="prose mt-8 max-w-none">
          <p className="whitespace-pre-wrap text-foreground">{event.description}</p>
        </div>
      )}

      {event.recurrence_description && (
        <p className="mt-4 text-sm text-muted">{event.recurrence_description}</p>
      )}

      {hasCoords && (
        <div className="mt-8">
          <MapLoader
            markers={[
              {
                id: event.id,
                name: event.location_name ?? event.title,
                latitude: event.latitude!,
                longitude: event.longitude!,
              },
            ]}
            center={[event.latitude!, event.longitude!]}
          />
        </div>
      )}

      {relatedEvents.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">{t("events.relatedTitle")}</h2>
          <p className="mt-2 text-muted">{t("events.relatedSubtitle")}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedEvents.map((relatedEvent) => (
              <EventCard key={relatedEvent.id} event={relatedEvent} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
