import {
  CONTENT_LANGUAGES,
  LOCALITIES,
  ORGANIZATION_CATEGORIES,
  ORGANIZATION_STATUSES,
} from "@/lib/constants";
import {
  createOrganizationAction,
  updateOrganizationAction,
} from "@/lib/actions/admin";
import type { Organization } from "@/lib/types";
import { useTranslations } from "next-intl";
import { selectControlClass, textControlClass } from "@/lib/form-styles";

type Props = {
  organization?: Organization;
  locale: string;
};

export function OrganizationForm({ organization, locale }: Props) {
  const t = useTranslations("admin");
  const action = organization
    ? updateOrganizationAction.bind(null, organization.id)
    : createOrganizationAction;

  const inputClass = textControlClass;
  const selectClass = selectControlClass;

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
          <label className="text-sm font-medium">{t("descriptionDe")}</label>
          <textarea name="description" rows={4} defaultValue={organization?.description ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("descriptionEn")}</label>
          <textarea name="description_en" rows={4} defaultValue={organization?.description_en ?? ""} className={inputClass} />
        </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Category *</label>
          <select name="category" required defaultValue={organization?.category} className={selectClass}>
            {ORGANIZATION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Status *</label>
          <select name="status" required defaultValue={organization?.status ?? "published"} className={selectClass}>
            {ORGANIZATION_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">{t("languagesLabel")}</label>
          <input
            name="languages"
            defaultValue={organization?.languages.join(", ") ?? "de"}
            className={inputClass}
            placeholder={CONTENT_LANGUAGES.join(", ")}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t("directorySourceUrl")}</label>
          <input
            name="directory_source_url"
            type="url"
            defaultValue={organization?.directory_source_url ?? ""}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">{t("email")}</label>
          <input name="email" type="email" defaultValue={organization?.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("phone")}</label>
          <input name="phone" defaultValue={organization?.phone ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">{t("address")}</label>
        <input name="address" defaultValue={organization?.address ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="text-sm font-medium">{t("locality")}</label>
        <select name="locality" defaultValue={organization?.locality ?? "meiringen"} className={selectClass}>
          {LOCALITIES.map((locality) => (
            <option key={locality.id} value={locality.id}>
              {locality.id}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">{t("latitude")}</label>
          <input name="latitude" type="number" step="any" defaultValue={organization?.latitude ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("longitude")}</label>
          <input name="longitude" type="number" step="any" defaultValue={organization?.longitude ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">{t("websiteUrl")}</label>
        <input name="website_url" type="url" defaultValue={organization?.website_url ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">{t("logoImageUrl")}</label>
          <input name="image_url" type="url" defaultValue={organization?.image_url ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("coverImageUrl")}</label>
          <input name="cover_image_url" type="url" defaultValue={organization?.cover_image_url ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">{t("coverImageCredit")}</label>
          <input name="cover_image_credit" defaultValue={organization?.cover_image_credit ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("coverCreditLink")}</label>
          <input name="cover_image_credit_url" type="url" defaultValue={organization?.cover_image_credit_url ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">{t("sourceUrl")}</label>
        <input name="source_url" type="url" defaultValue={organization?.source_url ?? ""} className={inputClass} />
      </div>
      <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white">
        {t("save")}
      </button>
      <a href={`/${locale}/admin/organizations`} className="ml-4 text-sm text-muted hover:underline">
        {t("cancel")}
      </a>
    </form>
  );
}
