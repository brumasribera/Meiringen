"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type Props = {
  imageUrl: string;
  title: string;
  className?: string;
};

function imageStyle(imageUrl: string) {
  return {
    backgroundImage: `url("${imageUrl.replace(/"/g, "%22")}")`,
  };
}

export function EventHeroImageViewer({
  imageUrl,
  title,
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

  const portalNode = typeof document === "undefined" ? null : document.body;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`cursor-zoom-in bg-cover bg-center text-left focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-inset ${className}`}
        style={imageStyle(imageUrl)}
        aria-label={`Open full screen image for ${title}`}
      >
        <span className="sr-only">Open image</span>
      </button>
      <span
        className="pointer-events-none absolute right-5 top-5 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-sm backdrop-blur-md"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M8 21H4a1 1 0 0 1-1-1v-4M16 21h4a1 1 0 0 0 1-1v-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {open &&
        portalNode &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-[22px] backdrop-blur-md"
            role="presentation"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
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
              aria-label={`${title} image`}
              className="relative inline-flex max-h-[calc(100vh-44px)] max-w-[calc(100vw-44px)] items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={imageUrl}
                alt={title}
                width={1600}
                height={900}
                unoptimized={imageUrl.startsWith("http")}
                referrerPolicy="no-referrer"
                className="max-h-[calc(100vh-44px)] max-w-[calc(100vw-44px)] object-scale-down shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]"
                priority={false}
              />
            </div>
          </div>,
          portalNode,
        )}
    </>
  );
}
