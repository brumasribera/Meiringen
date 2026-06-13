import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getEvents, getOrganizations } from "@/lib/data";
import { actionButtonClass } from "@/lib/button-styles";
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
      <section className="relative isolate overflow-hidden px-4 py-20 text-white md:py-28">
        <Image
          src="/images/meiringen-hero-wellhorn.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(7,12,20,0.82)_0%,rgba(15,23,42,0.58)_42%,rgba(15,23,42,0.22)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-black/20 p-8 shadow-2xl shadow-black/30 backdrop-blur-[2px] md:p-10">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
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
            <p className="mt-5 text-xs text-white/70">
              Photo:{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Wellhorn_from_Meiringen_BE,_Switzerland_(12881259074).jpg"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 transition hover:text-white"
              >
                Jan Remund
              </a>{" "}
              /{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Wellhorn_from_Meiringen_BE,_Switzerland_(12881259074).jpg"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 transition hover:text-white"
              >
                Wikimedia Commons
              </a>{" "}
              (
              <a
                href="https://creativecommons.org/licenses/by/2.0/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 transition hover:text-white"
              >
                CC BY 2.0
              </a>
              )
            </p>
          </div>
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
            href="/alerts"
            className={`mt-6 inline-block ${actionButtonClass} px-8 py-3`}
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
