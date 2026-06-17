"use client";

import { useState } from "react";
import { resolveOrgImageUrl } from "@/lib/org-image";

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
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  if (src && !imageFailed) {
    return (
      <div
        className={`${s.box} relative shrink-0 overflow-hidden ${radiusClass} border border-border bg-white`}
      >
        <img
          src={src}
          alt={`${name} logo`}
          className={`h-full w-full ${radiusClass} object-contain p-0.5`}
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.box} flex shrink-0 items-center justify-center ${radiusClass} bg-primary/10 font-semibold text-primary ${s.text}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
