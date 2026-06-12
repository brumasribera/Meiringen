import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertManageClient } from "@/components/AlertManageClient";
import { getOrganizations } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function AlertManagePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("alerts");

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted">{t("missingToken")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t("manageTitle")}</h1>
      <p className="mt-2 text-muted">{t("manageSubtitle")}</p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <AlertManageClient token={token} organizations={await getOrganizations()} />
      </div>
    </div>
  );
}
