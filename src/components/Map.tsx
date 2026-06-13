"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MapMarker, MapProviderStatus } from "./map-types";

const GoogleMapView = dynamic(
  () => import("./GoogleMapView").then((m) => m.GoogleMapView),
  { ssr: false }
);

const LeafletMapView = dynamic(
  () => import("./LeafletMapView").then((m) => m.LeafletMapView),
  { ssr: false }
);

type Props = {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  preferLeaflet?: boolean;
};

export type { MapMarker } from "./map-types";

export function Map({ markers, center, zoom = 12, className = "h-80", preferLeaflet = false }: Props) {
  const [status, setStatus] = useState<MapProviderStatus | null>(null);
  const [error, setError] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProvider() {
      try {
        const response = await fetch("/api/maps/provider");
        if (!response.ok) throw new Error("provider request failed");
        const data = (await response.json()) as MapProviderStatus;
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) {
          setError(true);
          setStatus({
            provider: "leaflet",
            usage: 0,
            limit: 500,
            month: new Date().toISOString().slice(0, 7),
            reason: "tracking_unavailable",
          });
        }
      }
    }

    loadProvider();
    return () => {
      cancelled = true;
    };
  }, []);

  if (markers.length === 0) return null;

  if (preferLeaflet) {
    return (
      <LeafletMapView
        markers={markers}
        center={center}
        zoom={zoom}
        className={className}
        fallbackReason="multi_marker"
      />
    );
  }

  if (!status) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border bg-card text-muted ${className}`}
      >
        Loading map…
      </div>
    );
  }

  if (status.provider === "google" && !googleFailed) {
    return (
      <GoogleMapView
        markers={markers}
        center={center}
        zoom={zoom}
        className={className}
        onAuthFailure={() => setGoogleFailed(true)}
      />
    );
  }

  return (
    <LeafletMapView
      markers={markers}
      center={center}
      zoom={zoom}
      className={className}
      fallbackReason={
        googleFailed
          ? "auth_failed"
          : error
            ? "tracking_unavailable"
            : status.reason
      }
    />
  );
}
