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
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-lg font-semibold shadow-sm transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="absolute right-4 top-4 z-10 flex gap-2">
      {previous ? (
        <Link href={previous.href} aria-label={previous.ariaLabel} title={previous.label} className={baseClass}>
          <span aria-hidden>←</span>
        </Link>
      ) : (
        <span aria-hidden className={`${baseClass} opacity-40`}>←</span>
      )}
      {next ? (
        <Link href={next.href} aria-label={next.ariaLabel} title={next.label} className={baseClass}>
          <span aria-hidden>→</span>
        </Link>
      ) : (
        <span aria-hidden className={`${baseClass} opacity-40`}>→</span>
      )}
    </div>
  );
}
