import { CATEGORIES, CONTENT_LANGUAGES, LOCALITIES } from "@/lib/constants";
import {
  createOrganizationAction,
  updateOrganizationAction,
} from "@/lib/actions/admin";
import type { Organization } from "@/lib/types";

type Props = {
  organization?: Organization;
  locale: string;
};

export function OrganizationForm({ organization, locale }: Props) {
  const action = organization
    ? updateOrganizationAction.bind(null, organization.id)
    : createOrganizationAction;

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Name *</label>
          <input name="name" required defaultValue={organization?.name} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">Slug</label>
          <input name="slug" defaultValue={organization?.slug} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Description (DE)</label>
        <textarea name="description" rows={4} defaultValue={organization?.description ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="text-sm font-medium">Description (EN)</label>
        <textarea name="description_en" rows={4} defaultValue={organization?.description_en ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Category *</label>
          <select name="category" required defaultValue={organization?.category} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Languages (comma-separated)</label>
          <input
            name="languages"
            defaultValue={organization?.languages.join(", ") ?? "de"}
            className={inputClass}
            placeholder={CONTENT_LANGUAGES.join(", ")}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" defaultValue={organization?.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input name="phone" defaultValue={organization?.phone ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Address</label>
        <input name="address" defaultValue={organization?.address ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="text-sm font-medium">Locality</label>
        <select name="locality" defaultValue={organization?.locality ?? "meiringen"} className={inputClass}>
          {LOCALITIES.map((locality) => (
            <option key={locality.id} value={locality.id}>
              {locality.id}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Latitude</label>
          <input name="latitude" type="number" step="any" defaultValue={organization?.latitude ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">Longitude</label>
          <input name="longitude" type="number" step="any" defaultValue={organization?.longitude ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Website URL</label>
        <input name="website_url" type="url" defaultValue={organization?.website_url ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Logo Image URL</label>
          <input name="image_url" type="url" defaultValue={organization?.image_url ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">Cover Image URL</label>
          <input name="cover_image_url" type="url" defaultValue={organization?.cover_image_url ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Source URL</label>
        <input name="source_url" type="url" defaultValue={organization?.source_url ?? ""} className={inputClass} />
      </div>
      <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white">
        Save
      </button>
      <a href={`/${locale}/admin/organizations`} className="ml-4 text-sm text-muted hover:underline">
        Cancel
      </a>
    </form>
  );
}
