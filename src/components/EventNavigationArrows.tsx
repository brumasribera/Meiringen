"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";

type NavItem = {
  href: string;
  label: string;
  ariaLabel: string;
};

type Props = {
  previous: NavItem | null;
  next: NavItem | null;
  prefetchHrefs?: string[];
};

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true']"));
}

export function EventNavigationArrows({ previous, next, prefetchHrefs = [] }: Props) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isInteractiveTarget(event.target)) return;

      if (event.key === "ArrowLeft" && previous) {
        event.preventDefault();
        window.location.assign(previous.href);
      }

      if (event.key === "ArrowRight" && next) {
        event.preventDefault();
        window.location.assign(next.href);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, previous]);

  useEffect(() => {
    const hrefs = Array.from(new Set(prefetchHrefs)).filter(Boolean);
    if (hrefs.length === 0) return;

    const schedule =
      window.requestIdleCallback ??
      ((callback: IdleRequestCallback) =>
        window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 300));

    const cancel = window.cancelIdleCallback ?? window.clearTimeout;

    const handle = schedule(() => {
      for (const href of hrefs) {
        router.prefetch(href);
      }
    });

    return () => cancel(handle);
  }, [prefetchHrefs, router]);

  if (!previous && !next) return null;

  const baseClass =
    "pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-card/95 text-foreground shadow-[0_4px_18px_rgba(15,23,42,0.08)] backdrop-blur-sm transition duration-200 hover:border-primary hover:text-primary hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-50 flex items-center justify-between px-2 sm:px-4 lg:px-6">
      {previous ? (
        <Link
          href={previous.href}
          aria-label={previous.ariaLabel}
          title={previous.label}
          className={baseClass}
        >
          <span aria-hidden className="flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </span>
        </Link>
      ) : (
        <span aria-hidden className={`${baseClass} opacity-35`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </span>
      )}
      {next ? (
        <Link
          href={next.href}
          aria-label={next.ariaLabel}
          title={next.label}
          className={baseClass}
        >
          <span aria-hidden className="flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      ) : (
        <span aria-hidden className={`${baseClass} opacity-35`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );
}
