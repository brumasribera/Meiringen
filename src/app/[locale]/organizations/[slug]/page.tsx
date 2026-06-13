import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getOrganizationBySlug,
  getEvents,
  getOrganizationFollowSummary,
  getRelatedOrganizationsForOrganization,
} from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { DeferredMapLoader } from "@/components/DeferredMapLoader";
import { resolveOrgDescription, resolveOrgImageUrl } from "@/lib/org-content";
import { OrgLogo } from "@/components/OrgLogo";
import { ShareButton } from "@/components/ShareButton";
import { actionButtonClass } from "@/lib/button-styles";
import { buildAlertHref } from "@/lib/utils";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationFollowButton } from "@/components/OrganizationFollowButton";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function OrganizationDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const organization = await getOrganizationBySlug(slug);

  if (!organization) notFound();

  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const [events, followSummary, relatedOrganizations] = await Promise.all([
    getEvents({ organizationId: organization.id, limit: 10 }),
    getOrganizationFollowSummary(organization.id, user?.id),
    getRelatedOrganizationsForOrganization(organization, 3),
  ]);
  const hasCoords = organization.latitude && organization.longitude;
  const description = resolveOrgDescription(organization, locale);
  const alertHref = buildAlertHref({ organizationId: organization.id });
  const phoneHref = organization.phone
    ? `tel:${organization.phone.replace(/\s+/g, "")}`
    : null;

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
          locality={organization.locality}
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

      {description && (
        <p className="mt-6 text-lg text-muted">{description}</p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">{t("organizations.contact")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <OrganizationFollowButton
            organizationId={organization.id}
            initialFollowing={followSummary.isFollowing}
            initialCount={followSummary.followerCount}
            locale={locale}
            userId={user?.id}
          />
          <Link href={alertHref} className={`${actionButtonClass} px-5 py-2.5 text-sm`}>
            {t("organizations.getAlertsForOrg")}
          </Link>
          {organization.website_url && (
            <a
              href={organization.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {t("organizations.visitWebsite")}
            </a>
          )}
          {organization.email && (
            <a
              href={`mailto:${organization.email}`}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {t("organizations.emailOrganization")}
            </a>
          )}
          {phoneHref && (
            <a
              href={phoneHref}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {t("organizations.callOrganization")}
            </a>
          )}
          <ShareButton
            title={organization.name}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
          />
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          {organization.address && (
            <div>
              <dt className="text-muted">{t("common.address")}</dt>
              <dd>{organization.address}</dd>
            </div>
          )}
          {organization.email && (
            <div>
              <dt className="text-muted">{t("common.email")}</dt>
              <dd>
                <a href={`mailto:${organization.email}`} className="text-primary hover:underline">
                  {organization.email}
                </a>
              </dd>
            </div>
          )}
          {organization.phone && (
            <div>
              <dt className="text-muted">{t("common.phone")}</dt>
              <dd>{organization.phone}</dd>
            </div>
          )}
          {organization.website_url && (
            <div>
              <dt className="text-muted">{t("common.website")}</dt>
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
          {organization.languages?.length > 0 && (
            <div>
              <dt className="text-muted">{t("newsletter.languages")}</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {(organization.languages ?? []).map((l) => (
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
          <DeferredMapLoader
            preferLeaflet
            markers={[
              {
                id: organization.id,
                name: organization.name,
                latitude: organization.latitude!,
                longitude: organization.longitude!,
                imageUrl: resolveOrgImageUrl(
                  organization.image_url,
                  organization.website_url,
                  organization.locality
                ),
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

      {relatedOrganizations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">{t("organizations.relatedTitle")}</h2>
          <p className="mt-2 text-muted">{t("organizations.relatedSubtitle")}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedOrganizations.map((relatedOrganization) => (
              <OrganizationCard
                key={relatedOrganization.id}
                organization={relatedOrganization}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
