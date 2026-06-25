"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { OrgLogo } from "@/components/OrgLogo";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";
import { resolveOrgImageUrl } from "@/lib/org-image";

type Props = {
  name: string;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  locality?: string | null;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  editable?: boolean;
  uploadUrl?: string;
};

export function OrgLogoImageViewer({
  name,
  imageUrl,
  websiteUrl,
  locality,
  size = "md",
  shape = "circle",
  editable = false,
  uploadUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(() => editable);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
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

  useEffect(() => {
    if (editable) {
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setCanEdit(isAdminEmail(data.user?.email));
    });

    return () => {
      cancelled = true;
    };
  }, [editable]);

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
        throw new Error(payload?.error ?? "Failed to update logo");
      }

      router.refresh();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to update logo");
    } finally {
      setUploading(false);
    }
  }

  const portalNode = typeof document === "undefined" ? null : document.body;

  return (
    <>
      <div className="group relative inline-block">
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

        {canEdit && <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />}
      </div>

      {canEdit && uploadError && (
        <p className="mt-2 text-xs text-red-600">{uploadError}</p>
      )}

      {open && portalNode && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-[22px] backdrop-blur-md"
          role="presentation"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 text-[11px] font-medium text-white backdrop-blur-md transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label={`Change logo for ${name}`}
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
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/30"
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
          </div>
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
        </div>,
        portalNode)}
    </>
  );
}
