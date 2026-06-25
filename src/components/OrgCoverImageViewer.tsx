"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OrgCoverArt } from "@/components/OrgCoverArt";
import type { OrganizationCategory } from "@/lib/constants";

type Props = {
  name: string;
  category: OrganizationCategory;
  coverImageUrl?: string | null;
  className?: string;
  editable?: boolean;
  uploadUrl?: string;
};

export function OrgCoverImageViewer({
  name,
  category,
  coverImageUrl,
  className = "",
  editable = false,
  uploadUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

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

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !uploadUrl) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadError(null);

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to update cover image");
      }

      router.refresh();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to update cover image"
      );
    } finally {
      setUploading(false);
    }
  }

  const portalNode = typeof document === "undefined" ? null : document.body;

  return (
    <>
      <div className="group relative">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full text-left"
          aria-label={`Open large image for ${name}`}
        >
          <OrgCoverArt
            category={category}
            coverImageUrl={coverImageUrl}
            className={className}
          />
        </button>

        {editable && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-sm backdrop-blur-md transition hover:bg-black/75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/40 group-hover:opacity-100 group-focus-within:opacity-100"
              aria-label={`Change cover image for ${name}`}
              disabled={uploading}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" fill="none">
                <path
                  d="M12 20h9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{uploading ? "Saving" : "Edit"}</span>
            </button>
          </>
        )}
      </div>

      {editable && uploadError && (
        <p className="mt-2 text-xs text-red-600">{uploadError}</p>
      )}

      {open && portalNode && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-[22px] backdrop-blur-md"
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
            aria-label={`${name} cover image`}
            className="relative inline-flex max-h-[calc(100vh-44px)] max-w-[calc(100vw-44px)] items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative inline-flex items-center justify-center">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt=""
                  width={1600}
                  height={900}
                  unoptimized={coverImageUrl.startsWith("http")}
                  referrerPolicy="no-referrer"
                  className="max-h-[calc(100vh-44px)] max-w-[calc(100vw-44px)] object-scale-down shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]"
                />
              ) : (
                <OrgCoverArt
                  category={category}
                  coverImageUrl={coverImageUrl}
                  className="h-auto w-auto max-h-[calc(100vh-44px)] max-w-[calc(100vw-44px)]"
                />
              )}
            </div>
          </div>
        </div>,
        portalNode)}
    </>
  );
}
