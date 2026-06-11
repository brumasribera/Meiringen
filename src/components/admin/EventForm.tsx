import { CATEGORIES, CONTENT_LANGUAGES, EVENT_STATUSES } from "@/lib/constants";
import { createEventAction, updateEventAction } from "@/lib/actions/admin";
import type { Event, Organization } from "@/lib/types";

type Props = {
  event?: Event;
  organizations: Organization[];
  locale: string;
};

export function EventForm({ event, organizations, locale }: Props) {
  const action = event
    ? updateEventAction.bind(null, event.id)
    : createEventAction;

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";

  const startDefault = event?.start_date
    ? new Date(event.start_date).toISOString().slice(0, 16)
    : "";
  const endDefault = event?.end_date
    ? new Date(event.end_date).toISOString().slice(0, 16)
    : "";

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Title *</label>
          <input name="title" required defaultValue={event?.title} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">Slug</label>
          <input name="slug" defaultValue={event?.slug} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea name="description" rows={4} defaultValue={event?.description ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Category *</label>
          <select name="category" required defaultValue={event?.category ?? "culture"} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Organization</label>
          <select name="organization_id" defaultValue={event?.organization_id ?? ""} className={inputClass}>
            <option value="">—</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select name="status" defaultValue={event?.status ?? "published"} className={inputClass}>
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Start date *</label>
          <input name="start_date" type="datetime-local" required defaultValue={startDefault} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">End date</label>
          <input name="end_date" type="datetime-local" defaultValue={endDefault} className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Location name</label>
          <input name="location_name" defaultValue={event?.location_name ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">Address</label>
          <input name="address" defaultValue={event?.address ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Price</label>
          <input name="price" defaultValue={event?.price ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">Language</label>
          <select name="language" defaultValue={event?.language ?? ""} className={inputClass}>
            <option value="">—</option>
            {CONTENT_LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input type="checkbox" name="is_recurring" id="is_recurring" defaultChecked={event?.is_recurring} />
          <label htmlFor="is_recurring" className="text-sm">Recurring</label>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Recurrence description</label>
        <input name="recurrence_description" defaultValue={event?.recurrence_description ?? ""} className={inputClass} />
      </div>
      <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white">
        Save
      </button>
      <a href={`/${locale}/admin/events`} className="ml-4 text-sm text-muted hover:underline">
        Cancel
      </a>
    </form>
  );
}
