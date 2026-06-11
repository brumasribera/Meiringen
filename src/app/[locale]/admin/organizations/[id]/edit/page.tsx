import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { OrganizationForm } from "@/components/admin/OrganizationForm";
import type { Organization } from "@/lib/types";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditOrganizationPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase.from("organizations").select("*").eq("id", id).single();
  if (!data) notFound();

  return <OrganizationForm organization={data as Organization} locale={locale} />;
}
