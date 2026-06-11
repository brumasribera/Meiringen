import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getOrganizationBySlug, getEvents } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { MapLoader } from "@/components/MapLoader";
import { OrgLogo } from "@/components/OrgLogo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function OrganizationDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const organization = await getOrganizationBySlug(slug);

  if (!organization) notFound();

  const events = await getEvents({ organizationId: organization.id, limit: 10 });
  const hasCoords = organization.latitude && organization.longitude;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/organizations" className="text-sm text-primary hover:underline">
        ← {t("common.back")}
      </Link>

      <div className="mt-6 flex items-start gap-5">
        <OrgLogo
          name={organization.name}
          imageUrl={organization.image_url}
          websiteUrl={organization.website_url}
          size="lg"
        />
        <div>
          <span className="inline-block pill bg-primary/10 text-primary">
            {t(`categories.${organization.category}`)}
          </span>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            {organization.name}
          </h1>
        </div>
      </div>

      {organization.description && (
        <p className="mt-6 text-lg text-muted">{organization.description}</p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">{t("organizations.contact")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          {organization.address && (
            <div>
              <dt className="text-muted">Address</dt>
              <dd>{organization.address}</dd>
            </div>
          )}
          {organization.email && (
            <div>
              <dt className="text-muted">Email</dt>
              <dd>
                <a href={`mailto:${organization.email}`} className="text-primary hover:underline">
                  {organization.email}
                </a>
              </dd>
            </div>
          )}
          {organization.phone && (
            <div>
              <dt className="text-muted">Phone</dt>
              <dd>{organization.phone}</dd>
            </div>
          )}
          {organization.website_url && (
            <div>
              <dt className="text-muted">Website</dt>
              <dd>
                <a
                  href={organization.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {organization.website_url}
                </a>
              </dd>
            </div>
          )}
          {organization.languages.length > 0 && (
            <div>
              <dt className="text-muted">{t("newsletter.languages")}</dt>
              <dd className="flex flex-wrap gap-2 mt-1">
                {organization.languages.map((l) => (
                  <span key={l} className="pill bg-accent/20 text-xs">
                    {t(`languages.${l}`)}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {hasCoords && (
        <div className="mt-8">
          <MapLoader
            markers={[
              {
                id: organization.id,
                name: organization.name,
                latitude: organization.latitude!,
                longitude: organization.longitude!,
              },
            ]}
            center={[organization.latitude!, organization.longitude!]}
          />
        </div>
      )}

      {events.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">{t("nav.events")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
