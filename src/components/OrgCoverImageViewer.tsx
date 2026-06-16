"use client";

import { useEffect, useState } from "react";
import { OrgCoverArt } from "@/components/OrgCoverArt";
import type { OrganizationCategory } from "@/lib/constants";

type Props = {
  name: string;
  category: OrganizationCategory;
  coverImageUrl?: string | null;
  className?: string;
};

export function OrgCoverImageViewer({
  name,
  category,
  coverImageUrl,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in text-left"
        aria-label={`Open large image for ${name}`}
      >
        <OrgCoverArt
          name={name}
          category={category}
          coverImageUrl={coverImageUrl}
          className={className}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-[22px] backdrop-blur-md"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} cover image`}
            className="relative flex h-[calc(100vh-44px)] w-[calc(100vw-44px)] items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Close image viewer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="relative flex h-full w-full items-center justify-center">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full rounded-[1rem] object-contain shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]"
                />
              ) : (
                <OrgCoverArt
                  name={name}
                  category={category}
                  coverImageUrl={coverImageUrl}
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
