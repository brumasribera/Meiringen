"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/routing";

type NavItem = {
  href: string;
  label: string;
  ariaLabel: string;
};

type Props = {
  previous: NavItem | null;
  next: NavItem | null;
};

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true']"));
}

export function EventNavigationArrows({ previous, next }: Props) {
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

  if (!previous && !next) return null;

  const baseClass =
    "pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-card/95 text-foreground shadow-lg shadow-black/10 backdrop-blur-sm transition duration-200 hover:border-primary hover:text-primary hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="pointer-events-none fixed left-0 top-1/2 z-50 flex w-full -translate-y-1/2 justify-between px-2 sm:px-4 lg:px-6">
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
