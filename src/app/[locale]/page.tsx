import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getEvents, getOrganizations } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { OrganizationCard } from "@/components/OrganizationCard";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [upcomingEvents, organizations, integrationEvents, festivalEvents, marketEvents] =
    await Promise.all([
      getEvents({ limit: 6 }),
      getOrganizations({ limit: 6 }),
      getEvents({ category: "integration", limit: 3 }),
      getEvents({ category: "festival", limit: 3 }),
      getEvents({ category: "market", limit: 3 }),
    ]);

  const festivalsAndMarkets = [...festivalEvents, ...marketEvents]
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 3);

  return (
    <div>
      <section className="hero-gradient relative overflow-hidden px-4 py-20 text-white md:py-28">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 200" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0,200 L200,80 L400,120 L600,40 L800,100 L1000,60 L1200,140 L1200,200 Z" fill="white" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-6xl">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90 md:text-xl">
            {t("heroSubtitle")}
          </p>
          <Link
            href="/events"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-primary transition hover:bg-accent-light"
          >
            {t("heroCta")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">{t("upcomingEvents")}</h2>
          <Link href="/events" className="text-sm font-medium text-primary hover:underline">
            {t("viewAll")} →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        {upcomingEvents.length === 0 && (
          <p className="text-muted">No events yet. Run the database seed.</p>
        )}
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">{t("exploreOrganizations")}</h2>
            <Link href="/organizations" className="text-sm font-medium text-primary hover:underline">
              {t("viewAll")} →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold md:text-3xl">{t("integrationCourses")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrationEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="bg-primary/5 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-2xl font-bold md:text-3xl">{t("festivalsMarkets")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {festivalsAndMarkets.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
          <h2 className="text-2xl font-bold">{t("newsletterTitle")}</h2>
          <p className="mx-auto mt-4 max-w-md text-muted">{t("newsletterSubtitle")}</p>
          <Link
            href="/account/newsletter"
            className="mt-6 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-light"
          >
            {t("newsletterCta")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-2xl font-bold md:text-3xl">{t("aboutTitle")}</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t("aboutText")}</p>
        <Link href="/about" className="mt-4 inline-block text-primary hover:underline">
          {t("viewAll")} →
        </Link>
      </section>
    </div>
  );
}
