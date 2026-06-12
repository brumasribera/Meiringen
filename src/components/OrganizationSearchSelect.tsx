"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Organization } from "@/lib/types";

type Props = {
  organizations: Organization[];
  value: string;
  onChange: (organizationId: string) => void;
  allLabel: string;
  id?: string;
  className?: string;
};

export function OrganizationSearchSelect({
  organizations,
  value,
  onChange,
  allLabel,
  id = "org-search-select",
  className,
}: Props) {
  const tOrg = useTranslations("organizations");
  const [search, setSearch] = useState("");

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return organizations;

    return organizations.filter((o) => {
      if (o.id === value) return true;
      return o.name.toLowerCase().includes(query);
    });
  }, [organizations, search, value]);

  const inputClass =
    className ??
    "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm";

  return (
    <div className="space-y-2">
      <input
        id={id}
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tOrg("search")}
        className={inputClass}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="">{allLabel}</option>
        {filteredOrganizations.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
