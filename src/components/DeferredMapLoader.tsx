"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MapLoader } from "./MapLoader";
import type { MapMarker } from "./map-types";

type Props = {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  preferLeaflet?: boolean;
};

export function DeferredMapLoader(props: Props) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  if (!ready) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border bg-card text-muted ${props.className ?? "h-80"}`}
      >
        Loading map…
      </div>
    );
  }

  return <MapLoader key={pathname} {...props} />;
}
