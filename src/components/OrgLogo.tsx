"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveOrgImageUrl } from "@/lib/org-image";
import { getRelaxingGradientClass } from "@/lib/relaxing-gradient";

type Props = {
  name: string;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  locality?: string | null;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
};

const sizes = {
  sm: { box: "h-10 w-10", px: 40, text: "text-sm" },
  md: { box: "h-14 w-14", px: 56, text: "text-lg" },
  lg: { box: "h-20 w-20", px: 80, text: "text-2xl" },
};

const REPEATED_ORG_LOGO_ASSETS = new Set([
  "/brand/org-logos/haslital-brienz-ch.png",
]);

function getFallbackLetter(name: string): string {
  const letter = name.trim().match(/[A-Za-z0-9ÄÖÜäöüß]/)?.[0];
  return (letter ?? "?").toUpperCase();
}

export function OrgLogo({
  name,
  imageUrl,
  websiteUrl,
  locality,
  size = "md",
  shape = "circle",
}: Props) {
  const src = resolveOrgImageUrl(imageUrl ?? null, websiteUrl ?? null, locality);
  const [imageFailed, setImageFailed] = useState(false);
  const s = sizes[size];
  const fallbackLetter = getFallbackLetter(name);
  const gradientClass = getRelaxingGradientClass(name);
  const shouldUseImage = Boolean(src && !imageFailed && !REPEATED_ORG_LOGO_ASSETS.has(src));

  const getRadiusClass = () => {
    if (shape === "circle") return "rounded-full";
    switch (size) {
      case "sm":
        return "rounded-lg";
      case "md":
        return "rounded-xl";
      case "lg":
      default:
        return "rounded-2xl";
    }
  };
  const radiusClass = getRadiusClass();

  if (shouldUseImage) {
    return (
      <div
        className={`${s.box} relative shrink-0 overflow-hidden ${radiusClass} border border-border bg-white flex items-center justify-center`}
      >
        <Image
          src={src}
          alt={`${name} logo`}
          width={s.px}
          height={s.px}
          unoptimized={src.startsWith("http")}
          className="h-full w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.box} flex shrink-0 items-center justify-center ${radiusClass} ${gradientClass} font-semibold text-slate-900 shadow-sm ring-1 ring-white/55 ${s.text}`}
      aria-hidden
    >
      <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.65)]">
        {fallbackLetter}
      </span>
    </div>
  );
}
