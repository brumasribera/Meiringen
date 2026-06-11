import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAdminStats } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const stats = await getAdminStats();

  const cards = [
    { label: t("stats.organizations"), value: stats.organizations },
    { label: t("stats.events"), value: stats.events },
    { label: t("stats.drafts"), value: stats.drafts },
    { label: t("stats.sources"), value: stats.sources },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
