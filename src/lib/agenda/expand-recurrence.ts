import type { SupabaseClient } from "@supabase/supabase-js";
import { agendaHorizonDate } from "./constants";

type RecurrenceTemplate = {
  id: string;
  organization_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: string | null;
  language: string | null;
  recurrence_description: string | null;
  recurrence_interval_days: number;
};

export async function expandRecurringEvents(
  supabase: SupabaseClient
): Promise<{ created: number; skipped: number; pruned: number }> {
  const now = new Date();
  const horizon = agendaHorizonDate(now);
  let created = 0;
  let skipped = 0;

  const { data: templates, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_recurring_template", true)
    .eq("status", "published");

  if (error) {
    throw new Error(error.message);
  }

  for (const template of (templates ?? []) as RecurrenceTemplate[]) {
    const templateStart = new Date(template.start_date);
    const templateEnd = template.end_date ? new Date(template.end_date) : null;
    const durationMs = templateEnd
      ? templateEnd.getTime() - templateStart.getTime()
      : 2 * 60 * 60 * 1000;
    const intervalMs = (template.recurrence_interval_days || 7) * 24 * 60 * 60 * 1000;

    let cursor = new Date(templateStart);
    while (cursor < now) {
      cursor = new Date(cursor.getTime() + intervalMs);
    }

    while (cursor <= horizon) {
      const occurrenceStart = new Date(cursor);
      const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);
      const dateKey = occurrenceStart.toISOString().slice(0, 10);
      const slug = `${template.slug}-${dateKey}`;

      const { error: insertError } = await supabase.from("events").insert({
        organization_id: template.organization_id,
        title: template.title,
        slug,
        description: template.description,
        category: template.category,
        start_date: occurrenceStart.toISOString(),
        end_date: occurrenceEnd.toISOString(),
        location_name: template.location_name,
        address: template.address,
        latitude: template.latitude,
        longitude: template.longitude,
        price: template.price,
        language: template.language,
        is_recurring: false,
        is_recurring_template: false,
        recurrence_parent_id: template.id,
        recurrence_description: template.recurrence_description,
        recurrence_interval_days: 7,
        status: "published",
      });

      if (insertError?.code === "23505") {
        skipped++;
      } else if (insertError) {
        console.error("expandRecurringEvents insert:", insertError.message);
      } else {
        created++;
      }

      cursor = new Date(cursor.getTime() + intervalMs);
    }
  }

  const { count, error: pruneError } = await supabase
    .from("events")
    .delete({ count: "exact" })
    .not("recurrence_parent_id", "is", null)
    .gt("start_date", horizon.toISOString());

  if (pruneError) {
    console.error("expandRecurringEvents prune:", pruneError.message);
  }

  return { created, skipped, pruned: count ?? 0 };
}

export function buildOccurrenceSlug(title: string, startDate: string): string {
  const dateKey = startDate.slice(0, 10);
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${dateKey}`;
}
