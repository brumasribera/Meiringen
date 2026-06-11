import { setRequestLocale } from "next-intl/server";
import { OrganizationForm } from "@/components/admin/OrganizationForm";

type Props = { params: Promise<{ locale: string }> };

export default async function NewOrganizationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OrganizationForm locale={locale} />;
}
