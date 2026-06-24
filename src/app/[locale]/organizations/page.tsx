import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getOrganizations } from "@/lib/data";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationFilters } from "@/components/OrganizationFilters";
import { ORGANIZATION_CATEGORIES } from "@/lib/constants";
import { getOrganizationDisplayRank } from "@/lib/org-content";
import type { Locality, OrganizationCategory } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OrganizationsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("organizations");
  const categories = Array.from(
    new Set(
      [
        ...(filters.categories?.split(",") ?? []),
        ...(filters.category ? [filters.category] : []),
      ].filter((category): category is OrganizationCategory =>
        ORGANIZATION_CATEGORIES.includes(category as OrganizationCategory)
      )
    )
  ) as OrganizationCategory[];

  const organizations = await getOrganizations({
    search: filters.search,
    category: categories[0],
    categories,
    locality: filters.locality as Locality | undefined,
  });

  const sortedOrganizations = [...organizations].sort((a, b) => {
    const diff = getOrganizationDisplayRank(a) - getOrganizationDisplayRank(b);
    if (diff !== 0) return diff;

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-border" />}>
          <OrganizationFilters />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedOrganizations.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>

      {organizations.length === 0 && (
        <p className="mt-8 text-center text-muted">{t("noResults")}</p>
      )}
    </div>
  );
}
