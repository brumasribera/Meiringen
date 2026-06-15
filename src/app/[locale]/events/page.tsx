import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEvents, getOrganizations } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { EventFilters } from "@/components/EventFilters";
import { EventAlertSignup } from "@/components/EventAlertSignup";
import type { ContentLanguage, EventCategory } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("events");

  const [events, organizations] = await Promise.all([
    getEvents({
      search: filters.search,
      category: filters.category as EventCategory | undefined,
      language: filters.language as ContentLanguage | undefined,
      organizationId: filters.organization,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo ? `${filters.dateTo}T23:59:59` : undefined,
    }),
    getOrganizations(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-border" />}>
          <EventFilters organizations={organizations} />
          <EventAlertSignup organizations={organizations} />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && (
        <p className="mt-8 text-center text-muted">{t("noResults")}</p>
      )}
    </div>
  );
}
