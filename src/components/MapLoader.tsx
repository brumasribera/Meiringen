"use client";

import dynamic from "next/dynamic";

export const MapLoader = dynamic(() => import("./Map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-card text-muted">
      Loading map…
    </div>
  ),
});

export type { MapMarker } from "./map-types";
