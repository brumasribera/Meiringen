import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSourceAction,
  updateSourceAction,
  deleteSourceAction,
} from "@/lib/actions/admin";
import { SCRAPER_TYPES } from "@/lib/constants";
import type { ScrapingSource } from "@/lib/types";
import { selectControlClass, textControlClass } from "@/lib/form-styles";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminSourcesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-muted">{t("supabaseNotConfigured")}</p>;
  }

  const { data: sources } = await supabase
    .from("scraping_sources")
    .select("*")
    .order("name");

  const inputClass = textControlClass;
  const selectClass = selectControlClass;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">{t("importSources")}</h2>

      <form action={createSourceAction} className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <input name="name" required placeholder={t("name")} className={inputClass} />
        <input name="url" required type="url" placeholder={t("url")} className={inputClass} />
        <select name="type" defaultValue="generic" className={selectClass}>
          {SCRAPER_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked />
          {t("active")}
        </label>
        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white sm:col-span-2 sm:w-fit">
          {t("addSource")}
        </button>
      </form>

      <div className="space-y-4">
        {(sources as ScrapingSource[] | null)?.map((source) => (
          <form
            key={source.id}
            action={updateSourceAction.bind(null, source.id)}
            className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
          >
            <input name="name" required defaultValue={source.name} className={inputClass} />
            <input name="url" required type="url" defaultValue={source.url} className={inputClass} />
            <select name="type" defaultValue={source.type} className={selectClass}>
              {SCRAPER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={source.active} />
              {t("active")}
            </label>
            <p className="text-xs text-muted sm:col-span-2">
              {t("lastChecked")}: {source.last_checked_at ? new Date(source.last_checked_at).toLocaleString(locale) : t("never")}
            </p>
            <div className="flex gap-4 sm:col-span-2">
              <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
                {t("save")}
              </button>
            </div>
          </form>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-primary/5">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">{t("type")}</th>
              <th className="p-4">{t("active")}</th>
              <th className="p-4">{t("delete")}</th>
            </tr>
          </thead>
          <tbody>
            {(sources ?? []).map((source) => (
              <tr key={source.id} className="border-b border-border">
                <td className="p-4">{source.name}</td>
                <td className="p-4 text-muted">{source.type}</td>
                <td className="p-4">{source.active ? t("yes") : t("no")}</td>
                <td className="p-4">
                  <form action={deleteSourceAction.bind(null, source.id)}>
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
