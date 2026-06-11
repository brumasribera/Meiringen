import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganizations } from "@/lib/data";
import { EventForm } from "@/components/admin/EventForm";
import type { Event } from "@/lib/types";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  if (!supabase) notFound();
  const [{ data: event }, organizations] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    getOrganizations(),
  ]);

  if (!event) notFound();

  return (
    <EventForm
      event={event as Event}
      organizations={organizations}
      locale={locale}
    />
  );
}
