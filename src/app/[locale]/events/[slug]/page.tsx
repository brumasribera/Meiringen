import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getEventBySlug } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { MapLoader } from "@/components/MapLoader";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const event = await getEventBySlug(slug);

  if (!event || event.status !== "published") notFound();

  const hasCoords = event.latitude && event.longitude;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/events" className="text-sm text-primary hover:underline">
        ← {t("common.back")}
      </Link>

      <div className="mt-6 flex flex-wrap gap-2">
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

      <h1 className="mt-4 text-3xl font-bold md:text-4xl">{event.title}</h1>
      <p className="mt-4 text-lg text-muted">
        {formatDateRange(event.start_date, event.end_date, locale)}
      </p>

      {event.organization && (
        <p className="mt-2">
          <Link
            href={`/organizations/${event.organization.slug}`}
            className="font-medium text-primary hover:underline"
          >
            {event.organization.name}
          </Link>
        </p>
      )}

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
    </div>
  );
}
