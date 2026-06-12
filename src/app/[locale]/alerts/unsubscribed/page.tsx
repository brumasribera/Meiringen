import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { actionButtonClass } from "@/lib/button-styles";

type Props = { params: Promise<{ locale: string }> };

export default async function UnsubscribedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("alerts");

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold">{t("unsubscribedTitle")}</h1>
        <p className="mt-3 text-muted">{t("unsubscribedText")}</p>
        <Link
          href="/alerts"
          className={`mt-6 inline-block ${actionButtonClass} px-6 py-3`}
        >
          {t("resubscribe")}
        </Link>
      </div>
    </div>
  );
}
