import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getNewsletterPreferences, getOrganizations } from "@/lib/data";
import { AlertPreferencesForm } from "@/components/AlertPreferencesForm";
import { Link } from "@/i18n/routing";
import { actionButtonClass } from "@/lib/button-styles";

type Props = { params: Promise<{ locale: string }> };

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("alerts");
  const tAccount = await getTranslations("newsletter");

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted">{tAccount("loginRequired")}</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted">{tAccount("loginRequired")}</p>
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

  const [preferences, organizations, profile] = await Promise.all([
    getNewsletterPreferences(user.id),
    getOrganizations(),
    supabase.from("profiles").select("email").eq("id", user.id).single(),
  ]);

  const email = profile.data?.email ?? user.email ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t("manageTitle")}</h1>
      <p className="mt-2 text-muted">{t("accountSubtitle")}</p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
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
    </div>
  );
}
