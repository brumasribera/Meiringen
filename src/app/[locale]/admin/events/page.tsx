import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { deleteEventAction } from "@/lib/actions/admin";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminEventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div>
        <p className="text-muted">{t("supabaseNotConfigured")}</p>
      </div>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h2 className="text-xl font-semibold">{t("events")}</h2>
        <Link href="/admin/events/new" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
          + {t("new")}
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-primary/5">
            <tr>
              <th className="p-4">{t("eventTitle")}</th>
              <th className="p-4">{t("date")}</th>
              <th className="p-4">{t("status")}</th>
              <th className="p-4">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((event) => (
              <tr key={event.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{event.title}</td>
                <td className="p-4 text-muted">
                  {new Date(event.start_date).toLocaleDateString(locale)}
                </td>
                <td className="p-4">
                  <span className={`pill text-xs ${event.status === "draft" ? "bg-accent/30" : "bg-primary/10 text-primary"}`}>
                    {event.status}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin/events/${event.id}/edit`} className="text-primary hover:underline">Edit</Link>
                  <form action={deleteEventAction.bind(null, event.id)} className="inline ml-4">
                    <button type="submit" className="text-red-600 hover:underline">{t("delete")}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
