"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Organization } from "@/lib/types";

type Props = { organization: Organization };

export function OrganizationCard({ organization }: Props) {
  const t = useTranslations();

  return (
    <Link
      href={`/organizations/${organization.slug}`}
      className="card-hover block rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <span className="pill bg-primary/10 text-primary">
        {t(`categories.${organization.category}`)}
      </span>
      <h3 className="mt-3 text-lg font-semibold">{organization.name}</h3>
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
