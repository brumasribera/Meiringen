"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { OrgCoverArt } from "@/components/OrgCoverArt";
import { OrgLogo } from "@/components/OrgLogo";
import { resolveOrgDescription } from "@/lib/org-content";
import type { Organization } from "@/lib/types";

type Props = { organization: Organization };

export function OrganizationCard({ organization }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const description = resolveOrgDescription(organization, locale);
  const coverImageUrl = organization.cover_image_url ?? null;

  return (
    <Link
      href={`/organizations/${organization.slug}`}
      className="card-hover group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm"
    >
      <div className="relative">
        <OrgCoverArt
          category={organization.category}
          coverImageUrl={coverImageUrl}
          className="h-36"
        />
        <div className="absolute inset-x-0 top-4 flex items-start justify-end px-5">
          <span className="pill border border-white/50 bg-white/88 text-primary shadow-sm backdrop-blur-sm">
            {t(`categories.${organization.category}`)}
          </span>
        </div>
        <div className="absolute left-5 top-full -translate-y-1/2">
          <OrgLogo
            name={organization.name}
            imageUrl={organization.image_url}
            websiteUrl={organization.website_url}
            locality={organization.locality}
            size="md"
            shape="square"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-10">
        <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">
          {organization.name}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
            {description}
          </p>
        )}
        <span className="mt-auto pt-4 text-sm font-medium text-primary">
          {t("organizations.viewDetails")} →
        </span>
      </div>
    </Link>
  );
}
