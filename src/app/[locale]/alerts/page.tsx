import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AlertPreferencesForm } from "@/components/AlertPreferencesForm";
import { getOrganizations } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ organization?: string }>;
};

export default async function AlertsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { organization } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("alerts");

  const [organizations, supabase] = await Promise.all([
    getOrganizations(),
    createClient(),
  ]);
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const organizationIds =
    organization && organizations.some((o) => o.id === organization)
      ? [organization]
      : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-[#F4C430] px-6 py-8 text-[#111111]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">
            Meiringen.life
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="mt-3 max-w-xl text-base opacity-90">{t("subtitle")}</p>
        </div>
        <div className="p-6 md:p-8">
          <AlertPreferencesForm
            userId={user?.id}
            showOrganizations
            organizations={organizations}
            initial={organizationIds ? { organization_ids: organizationIds } : undefined}
          />
          {user ? (
            <p className="mt-6 text-sm text-muted">
              {t("loggedInHint")}{" "}
              <Link href="/account/newsletter" className="font-medium text-primary hover:underline">
                {t("accountLink")}
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-sm text-muted">
              {t("loginHint")}{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t("loginLink")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
