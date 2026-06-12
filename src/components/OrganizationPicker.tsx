"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Organization } from "@/lib/types";

type Props = {
  organizations: Organization[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  id?: string;
};

export function OrganizationPicker({
  organizations,
  selectedIds,
  onChange,
  id = "org-picker-search",
}: Props) {
  const t = useTranslations("alerts");
  const tOrg = useTranslations("organizations");
  const [search, setSearch] = useState("");

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return organizations;

    return organizations.filter(
      (o) =>
        selectedIds.includes(o.id) || o.name.toLowerCase().includes(query)
    );
  }, [organizations, search, selectedIds]);

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((value) => value !== id)
        : [...selectedIds, id]
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mt-1 block text-sm text-muted">
        {t("organizationsHint")}
      </label>
      <input
        id={id}
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tOrg("search")}
        className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
      />
      {selectedIds.length > 0 && (
        <p className="mt-2 text-xs font-medium text-muted">
          {t("organizationsSelected", { count: selectedIds.length })}
        </p>
      )}
      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border p-4">
        {filteredOrganizations.length === 0 ? (
          <p className="text-sm text-muted">{tOrg("noResults")}</p>
        ) : (
          filteredOrganizations.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedIds.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
              {o.name}
            </label>
          ))
        )}
      </div>
    </div>
  );
}
