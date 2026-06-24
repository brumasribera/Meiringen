"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { SearchResult } from "@/lib/types";

function SearchThumb({
  src,
  category,
}: {
  src: string | null;
  category: string;
}) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/70 bg-muted shadow-sm">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="48px"
          unoptimized={src.startsWith("http")}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {category.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

export function HeaderSearch() {
  const t = useTranslations();
  const tc = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const trimmed = query.trim();
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&locale=${locale}`,
          { signal: controller.signal }
        );
        if (!response.ok) return;
        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [locale, open, query]);

  const grouped = useMemo(
    () => ({
      orgs: results.filter((result) => result.type === "organization"),
      events: results.filter((result) => result.type === "event"),
    }),
    [results]
  );

  const modal = open
      ? createPortal(
        <div
          className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="mx-auto flex h-full w-full max-w-2xl items-start px-4 py-6">
            <div
              className="mt-10 w-full overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setLoading(true);
                    }}
                    placeholder={`${t("common.search")} orgs, events...`}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
                  >
                    {t("common.back")}
                  </button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-auto p-4">
                {loading ? (
                  <p className="text-sm text-muted">Loading…</p>
                ) : (
                  <div className="space-y-5">
                    {grouped.orgs.length > 0 && (
                      <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                          Organizations
                        </h3>
                        <div className="space-y-2">
                          {grouped.orgs.map((result) => (
                            <Link
                              key={`${result.type}-${result.id}`}
                              href={result.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                            >
                              <SearchThumb
                                src={result.image_url}
                                category={result.category}
                              />
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {result.title}
                                </div>
                                <div className="truncate text-xs text-muted">
                                  {result.subtitle}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}
                    {grouped.events.length > 0 && (
                      <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                          Events
                        </h3>
                        <div className="space-y-2">
                          {grouped.events.map((result) => (
                            <Link
                              key={`${result.type}-${result.id}`}
                              href={result.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                            >
                              <SearchThumb
                                src={result.image_url}
                                category={result.category}
                              />
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {result.title}
                                </div>
                                <div className="truncate text-xs text-muted">
                                  {result.subtitle}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}
                    {grouped.orgs.length === 0 && grouped.events.length === 0 && (
                      <p className="text-sm text-muted">{tc("noResults")}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setQuery("");
          setLoading(true);
        }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:text-primary md:w-auto md:gap-2 md:border md:border-border md:bg-white/75 md:px-3.5 md:text-sm md:font-medium md:shadow-sm md:hover:border-primary"
        aria-label={t("common.search")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
        <span className="hidden text-sm lg:inline">{t("common.search")}</span>
      </button>

      {modal}
    </>
  );
}
