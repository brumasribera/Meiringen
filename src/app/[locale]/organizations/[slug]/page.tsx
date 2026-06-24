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
import { resolveOrgDescription } from "@/lib/org-content";
import { OrgLogoImageViewer } from "@/components/OrgLogoImageViewer";
import { ShareButton } from "@/components/ShareButton";
import { actionButtonClass } from "@/lib/button-styles";
import { buildAlertHref, buildGoogleMapsUrl } from "@/lib/utils";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationFollowButton } from "@/components/OrganizationFollowButton";
import { createClient } from "@/lib/supabase/server";
import { OrgCoverImageViewer } from "@/components/OrgCoverImageViewer";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = "force-dynamic";

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
  const description = resolveOrgDescription(organization, locale);
  const coverImageUrl = organization.cover_image_url ?? null;
  const alertHref = buildAlertHref({ organizationId: organization.id });
  const mapsHref = organization.address
    ? buildGoogleMapsUrl({ query: organization.address })
    : null;
  const phoneHref = organization.phone
    ? `tel:${organization.phone.replace(/\s+/g, "")}`
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/organizations" className="text-sm text-primary hover:underline">
        ← {t("common.back")}
      </Link>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="relative">
          <OrgCoverImageViewer
            name={organization.name}
            category={organization.category}
            coverImageUrl={coverImageUrl}
            className="h-52 md:h-64"
          />
          <div className="absolute inset-x-0 top-0 flex justify-end px-6 pt-6 md:px-8">
            <span className="inline-block pill border border-white/45 bg-white/88 text-primary shadow-sm backdrop-blur-sm">
              {t(`categories.${organization.category}`)}
            </span>
          </div>
          {organization.cover_image_url && organization.cover_image_credit && (
            <div className="absolute bottom-5 right-5 max-w-[calc(100%-2.5rem)] rounded-2xl bg-black/45 px-3 py-2 text-xs text-white shadow-sm backdrop-blur-sm md:bottom-6 md:right-6 md:max-w-md">
              <span className="font-medium">{t("organizations.photoCredit")}:</span>{" "}
              {organization.cover_image_credit_url ? (
                <a
                  href={organization.cover_image_credit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white/50 underline-offset-2 transition hover:decoration-white"
                >
                  {organization.cover_image_credit}
                </a>
              ) : (
                organization.cover_image_credit
              )}
            </div>
          )}
          <div className="absolute left-6 top-full -translate-y-1/2 md:left-8">
            <div className="rounded-[1.75rem] shadow-[0_22px_44px_-24px_rgba(15,23,42,0.65)] ring-1 ring-black/5">
              <OrgLogoImageViewer
                name={organization.name}
                imageUrl={organization.image_url}
                websiteUrl={organization.website_url}
                locality={organization.locality}
                size="lg"
                shape="square"
              />
            </div>
          </div>
        </div>
        <div className="px-6 pb-8 pt-14 md:px-8 md:pt-16">
          <h1 className="text-3xl font-bold md:text-4xl">
            {organization.name}
          </h1>
          {description && (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              {description}
            </p>
          )}
        </div>
      </div>

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
              <dd>
                {mapsHref ? (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {organization.address}
                  </a>
                ) : (
                  organization.address
                )}
              </dd>
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
