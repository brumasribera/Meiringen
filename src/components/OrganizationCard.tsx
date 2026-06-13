"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { OrgCoverArt } from "@/components/OrgCoverArt";
import { OrgLogo } from "@/components/OrgLogo";
import { resolveOrgCoverImageUrl, resolveOrgDescription } from "@/lib/org-content";
import type { Organization } from "@/lib/types";

type Props = { organization: Organization };

export function OrganizationCard({ organization }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const description = resolveOrgDescription(organization, locale);
  const coverImageUrl = resolveOrgCoverImageUrl(organization.image_url);

  return (
    <Link
      href={`/organizations/${organization.slug}`}
      className="card-hover group block overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm"
    >
      <div className="relative">
        <OrgCoverArt
          name={organization.name}
          category={organization.category}
          coverImageUrl={coverImageUrl}
          className="h-36"
        />
        <div className="absolute inset-x-0 top-4 flex items-start justify-end px-5">
          <span className="pill border border-white/50 bg-white/88 text-primary shadow-sm backdrop-blur-sm">
            {t(`categories.${organization.category}`)}
          </span>
        </div>
        <div className="absolute left-5 top-full -translate-y-1/2 rounded-[1.35rem] bg-white p-1.5 shadow-[0_18px_32px_-20px_rgba(15,23,42,0.65)] ring-1 ring-black/5">
          <OrgLogo
            name={organization.name}
            imageUrl={organization.image_url}
            websiteUrl={organization.website_url}
            locality={organization.locality}
            size="md"
          />
        </div>
      </div>
      <div className="px-5 pb-5 pt-10">
        <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">
          {organization.name}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
            {description}
          </p>
        )}
        {organization.address && (
          <p className="mt-3 text-sm text-muted">{organization.address}</p>
        )}
        {organization.locality && organization.locality !== "meiringen" && (
          <p className="mt-1 text-xs text-muted">
            {t(`localities.${organization.locality}`)}
          </p>
        )}
        <span className="mt-4 inline-block text-sm font-medium text-primary">
          {t("organizations.viewDetails")} →
        </span>
      </div>
    </Link>
  );
}
