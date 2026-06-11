import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getOrganizations } from "@/lib/data";
import { resolveOrgImageUrl } from "@/lib/org-content";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationFilters } from "@/components/OrganizationFilters";
import { MapLoader } from "@/components/MapLoader";
import type { Category, Locality } from "@/lib/constants";
import { getLocalityCenter } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OrganizationsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("organizations");

  const organizations = await getOrganizations({
    search: filters.search,
    category: filters.category as Category | undefined,
    locality: filters.locality as Locality | undefined,
  });

  const markers = organizations
    .filter((o) => o.latitude && o.longitude)
    .map((o) => ({
      id: o.id,
      name: o.name,
      latitude: o.latitude!,
      longitude: o.longitude!,
      href: `/${locale}/organizations/${o.slug}`,
      imageUrl: resolveOrgImageUrl(o.image_url, o.website_url, o.locality),
    }));

  const mapCenter = filters.locality
    ? (() => {
        const { lat, lng } = getLocalityCenter(filters.locality as Locality);
        return [lat, lng] as [number, number];
      })()
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-border" />}>
          <OrganizationFilters />
        </Suspense>
      </div>

      {markers.length > 0 && (
        <div className="mt-8">
          <MapLoader markers={markers} center={mapCenter} className="h-96" />
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>

      {organizations.length === 0 && (
        <p className="mt-8 text-center text-muted">{t("noResults")}</p>
      )}
    </div>
  );
}
