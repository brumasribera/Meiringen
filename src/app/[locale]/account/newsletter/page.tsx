import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  getFollowedOrganizations,
  getInterestedEvents,
  getNewsletterPreferences,
  getOrganizations,
} from "@/lib/data";
import { AlertPreferencesForm } from "@/components/AlertPreferencesForm";
import { Link } from "@/i18n/routing";
import { actionButtonClass } from "@/lib/button-styles";
import { EventCard } from "@/components/EventCard";
import { OrganizationCard } from "@/components/OrganizationCard";

type Props = { params: Promise<{ locale: string }> };

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("alerts");
  const tAccount = await getTranslations("account");
  const tNewsletter = await getTranslations("newsletter");
  const tCategories = await getTranslations("categories");
  const tLanguages = await getTranslations("languages");

  const supabase = await createClient();
  if (!supabase) {
    return (
        <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted">{tNewsletter("loginRequired")}</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted">{tNewsletter("loginRequired")}</p>
        <Link
          href="/login"
          className={`mt-4 inline-block ${actionButtonClass} px-6 py-2`}
        >
          Login
        </Link>
        <p className="mt-4 text-sm text-muted">
          <Link href="/alerts" className="text-primary hover:underline">
            {t("publicSubscribeLink")}
          </Link>
        </p>
      </div>
    );
  }

  const [preferences, organizations, profile, followedOrganizations, interestedEvents] =
    await Promise.all([
    getNewsletterPreferences(user.id),
    getOrganizations(),
    supabase.from("profiles").select("email").eq("id", user.id).single(),
    getFollowedOrganizations(user.id, 50),
    getInterestedEvents(user.id, 50),
  ]);

  const email = profile.data?.email ?? user.email ?? "";
  const alertOrganizations = (preferences?.organization_ids ?? [])
    .map((organizationId) =>
      organizations.find((organization) => organization.id === organizationId)
    )
    .filter((organization): organization is (typeof organizations)[number] =>
      Boolean(organization)
    );
  const hasSavedInterests =
    (preferences?.categories?.length ?? 0) > 0 ||
    (preferences?.languages?.length ?? 0) > 0 ||
    alertOrganizations.length > 0;
  const savedInterestCount =
    (preferences?.categories?.length ?? 0) +
    (preferences?.languages?.length ?? 0) +
    alertOrganizations.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{tAccount("title")}</h1>
      <p className="mt-2 max-w-2xl text-muted">{tAccount("subtitle")}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">{tAccount("savedInterests")}</p>
          <p className="mt-3 text-3xl font-bold">{savedInterestCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">{tAccount("followedOrganizations")}</p>
          <p className="mt-3 text-3xl font-bold">{followedOrganizations.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">{tAccount("interestedEvents")}</p>
          <p className="mt-3 text-3xl font-bold">{interestedEvents.length}</p>
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">{tAccount("savedInterests")}</h2>
        {!hasSavedInterests ? (
          <p className="mt-3 text-sm text-muted">{tAccount("savedInterestsEmpty")}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {(preferences?.categories?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-medium text-muted">{tAccount("categories")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(preferences?.categories ?? []).map((category) => (
                    <span key={category} className="pill bg-primary/10 text-primary">
                      {tCategories(category)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(preferences?.languages?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-medium text-muted">{tAccount("languages")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(preferences?.languages ?? []).map((language) => (
                    <span key={language} className="pill bg-accent/20 text-foreground">
                      {tLanguages(language)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {alertOrganizations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted">{tAccount("organizations")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {alertOrganizations.map((organization) => (
                    <span
                      key={organization.id}
                      className="pill bg-primary/10 text-primary"
                    >
                      {organization.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{tAccount("followedOrganizations")}</h2>
            <p className="mt-2 text-muted">{tAccount("followedSubtitle")}</p>
          </div>
          <Link href="/organizations" className="text-sm font-medium text-primary hover:underline">
            {tAccount("exploreOrganizations")}
          </Link>
        </div>
        {followedOrganizations.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {followedOrganizations.map((organization) => (
              <OrganizationCard key={organization.id} organization={organization} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-6">
            <p className="text-sm text-muted">{tAccount("followedEmpty")}</p>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{tAccount("interestedEvents")}</h2>
            <p className="mt-2 text-muted">{tAccount("interestedSubtitle")}</p>
          </div>
          <Link href="/events" className="text-sm font-medium text-primary hover:underline">
            {tAccount("exploreEvents")}
          </Link>
        </div>
        {interestedEvents.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interestedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-6">
            <p className="text-sm text-muted">{tAccount("interestedEmpty")}</p>
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-2xl font-bold">{t("manageTitle")}</h2>
        <p className="mt-2 text-muted">{t("accountSubtitle")}</p>
        <div className="mt-6">
        <AlertPreferencesForm
          userId={user.id}
          emailReadOnly
          showOrganizations
          organizations={organizations}
          initial={{
            email,
            frequency: preferences?.frequency ?? "weekly",
            categories: preferences?.categories ?? [],
            languages: preferences?.languages ?? [locale],
            organization_ids: preferences?.organization_ids ?? [],
          }}
        />
        </div>
      </section>
    </div>
  );
}
