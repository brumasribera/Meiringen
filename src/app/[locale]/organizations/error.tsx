"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type Props = {
  reset: () => void;
};

export default function OrganizationsError({ reset }: Props) {
  const t = useTranslations("common");

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-muted">This organization page could not be loaded.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#F4C430] px-6 py-2.5 text-sm font-semibold text-[#111111]"
        >
          Try again
        </button>
        <Link
          href="/organizations"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold"
        >
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
