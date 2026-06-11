import { setRequestLocale } from "next-intl/server";
import { getOrganizations } from "@/lib/data";
import { EventForm } from "@/components/admin/EventForm";

type Props = { params: Promise<{ locale: string }> };

export default async function NewEventPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const organizations = await getOrganizations();
  return <EventForm organizations={organizations} locale={locale} />;
}
