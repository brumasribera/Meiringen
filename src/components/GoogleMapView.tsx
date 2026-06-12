"use client";

import { useEffect, useRef, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import type { MapMarker } from "./map-types";

type Props = {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onAuthFailure?: () => void;
};

const DEFAULT_CENTER = { lat: 46.7275, lng: 8.1875 };
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || markers.length === 0) return;

    if (markers.length === 1) {
      map.setCenter({ lat: markers[0].latitude, lng: markers[0].longitude });
      map.setZoom(14);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const marker of markers) {
      bounds.extend({ lat: marker.latitude, lng: marker.longitude });
    }
    map.fitBounds(bounds, 48);
  }, [map, markers]);

  return null;
}

function EntityMarker({ marker }: { marker: MapMarker }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        position={{ lat: marker.latitude, lng: marker.longitude }}
        onClick={() => setOpen(true)}
        title={marker.name}
      >
        {marker.imageUrl ? (
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={marker.imageUrl}
              alt=""
              className="h-8 w-8 object-contain"
            />
          </div>
        ) : (
          <Pin
            background="var(--primary, #1b4332)"
            glyphColor="#ffffff"
            borderColor="#ffffff"
          />
        )}
      </AdvancedMarker>
      {open && (
        <InfoWindow
          position={{ lat: marker.latitude, lng: marker.longitude }}
          onCloseClick={() => setOpen(false)}
        >
          <div className="max-w-48 text-sm">
            <strong>{marker.name}</strong>
            {marker.href && (
              <div className="mt-1">
                <a href={marker.href} className="text-primary underline">
                  Details
                </a>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function GoogleMapView({
  markers,
  center,
  zoom = 12,
  className = "h-80",
  onAuthFailure,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const mapCenter = center
    ? { lat: center[0], lng: center[1] }
    : markers[0]
      ? { lat: markers[0].latitude, lng: markers[0].longitude }
      : DEFAULT_CENTER;

  useEffect(() => {
    if (!apiKey || !onAuthFailure) return;
    const root = containerRef.current;
    if (!root) return;

    const check = () => {
      if (root.querySelector(".gm-err-container")) onAuthFailure();
    };

    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, subtree: true });
    const timer = window.setInterval(check, 500);
    const timeout = window.setTimeout(check, 4000);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, [apiKey, onAuthFailure]);

  if (!apiKey) return null;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-2xl border border-border ${className}`}
    >
      <APIProvider apiKey={apiKey} libraries={["marker"]}>
        <GoogleMap
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          mapId={MAP_ID}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          className="h-full w-full"
        >
          <FitBounds markers={markers} />
          {markers.map((marker) => (
            <EntityMarker key={marker.id} marker={marker} />
          ))}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
