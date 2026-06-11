import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getNewsletterPreferences, getOrganizations } from "@/lib/data";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Link } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted">{t("loginRequired")}</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted">{t("loginRequired")}</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-white"
        >
          Login
        </Link>
      </div>
    );
  }

  const [preferences, organizations] = await Promise.all([
    getNewsletterPreferences(user.id),
    getOrganizations(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <NewsletterForm
          userId={user.id}
          preferences={preferences}
          organizations={organizations}
        />
      </div>
    </div>
  );
}
