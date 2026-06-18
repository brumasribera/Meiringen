"use client";

import { useEffect, useState } from "react";
import { OrgLogo } from "@/components/OrgLogo";
import { resolveOrgImageUrl } from "@/lib/org-image";

type Props = {
  name: string;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  locality?: string | null;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
};

export function OrgLogoImageViewer({
  name,
  imageUrl,
  websiteUrl,
  locality,
  size = "md",
  shape = "circle",
}: Props) {
  const [open, setOpen] = useState(false);
  const src = resolveOrgImageUrl(imageUrl ?? null, websiteUrl ?? null, locality);

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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="block outline-none focus:ring-2 focus:ring-primary/50"
        style={{ borderRadius: shape === "square" ? "inherit" : "9999px" }}
        aria-label={`Open large logo for ${name}`}
      >
        <OrgLogo
          name={name}
          imageUrl={imageUrl}
          websiteUrl={websiteUrl}
          locality={locality}
          size={size}
          shape={shape}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-[22px] backdrop-blur-md"
          role="presentation"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute right-5 top-5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Close image viewer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
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
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} logo`}
            className="relative inline-flex max-h-[calc(100vh-44px)] max-w-[calc(100vw-44px)] items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative inline-flex items-center justify-center">
              {src ? (
                <img
                  src={src}
                  alt={`${name} logo`}
                  referrerPolicy="no-referrer"
                  className="max-h-[calc(100vh-44px)] max-w-[calc(100vw-44px)] object-scale-down shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]"
                />
              ) : (
                <OrgLogo
                  name={name}
                  imageUrl={imageUrl}
                  websiteUrl={websiteUrl}
                  locality={locality}
                  size="lg"
                  shape={shape}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
