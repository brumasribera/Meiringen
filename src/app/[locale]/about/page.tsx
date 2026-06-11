import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-6 text-lg text-muted">{t("intro")}</p>
      <p className="mt-4 text-lg">{t("mission")}</p>

      <h2 className="mt-12 text-2xl font-bold">{t("features")}</h2>
      <ul className="mt-6 space-y-4">
        {[t("featureEvents"), t("featureOrgs"), t("featureNewsletter"), t("featureMultilingual")].map(
          (feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="mt-0.5 text-primary">✓</span>
              <span>{feature}</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
