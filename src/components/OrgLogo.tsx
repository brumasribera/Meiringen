"use client";

import Image from "next/image";
import { useState } from "react";
import { isGradientOnlyOrgLogoAsset, resolveOrgImageUrl } from "@/lib/org-image";
import { getRelaxingGradient } from "@/lib/relaxing-gradient";

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
  const gradientStyle = getRelaxingGradient(name);
  const shouldUseImage = Boolean(src && !imageFailed && !isGradientOnlyOrgLogoAsset(src));

  const getRadiusClass = () => {
    if (shape === "circle") return "rounded-full";
    switch (size) {
      case "sm":
        return "rounded-md";
      case "md":
        return "rounded-lg";
      case "lg":
      default:
        return "rounded-xl";
    }
  };
  const radiusClass = getRadiusClass();

  if (shouldUseImage) {
    return (
      <div
        className={`${s.box} relative shrink-0 overflow-hidden ${radiusClass} border border-border bg-white flex items-center justify-center`}
      >
        <Image
          src={src ?? ""}
          alt={`${name} logo`}
          width={s.px}
          height={s.px}
          unoptimized={(src ?? "").startsWith("http")}
          className="h-full w-full rounded-[inherit] object-contain"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.box} flex shrink-0 items-center justify-center ${radiusClass} font-semibold text-white shadow-sm ring-1 ring-white/45 ${s.text}`}
      style={gradientStyle}
      aria-hidden
    >
      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.22)]">
        {fallbackLetter}
      </span>
    </div>
  );
}
