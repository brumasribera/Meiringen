"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { OrgLogo } from "@/components/OrgLogo";
import type { Organization } from "@/lib/types";

type Props = { organization: Organization };

export function OrganizationCard({ organization }: Props) {
  const t = useTranslations();

  return (
    <Link
      href={`/organizations/${organization.slug}`}
      className="card-hover block rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <OrgLogo
          name={organization.name}
          imageUrl={organization.image_url}
          websiteUrl={organization.website_url}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <span className="pill bg-primary/10 text-primary">
            {t(`categories.${organization.category}`)}
          </span>
          <h3 className="mt-2 text-lg font-semibold">{organization.name}</h3>
        </div>
      </div>
      {organization.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted">
          {organization.description}
        </p>
      )}
      {organization.address && (
        <p className="mt-3 text-sm text-muted">{organization.address}</p>
      )}
      <span className="mt-4 inline-block text-sm font-medium text-primary">
        {t("organizations.viewDetails")} →
      </span>
    </Link>
  );
}
