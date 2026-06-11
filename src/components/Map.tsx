"use client";

import { useEffect, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";

export type MapMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  href?: string;
  imageUrl?: string | null;
};

type Props = {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
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

function GoogleMapView({ markers, center, zoom = 12, className = "h-80" }: Props) {
  const mapCenter = center
    ? { lat: center[0], lng: center[1] }
    : markers[0]
      ? { lat: markers[0].latitude, lng: markers[0].longitude }
      : DEFAULT_CENTER;

  return (
    <div className={`overflow-hidden rounded-2xl border border-border ${className}`}>
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
    </div>
  );
}

export function Map({ markers, center, zoom = 12, className = "h-80" }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (markers.length === 0) return null;

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border bg-card px-6 text-center text-sm text-muted ${className}`}
      >
        Set <code className="mx-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
        enable Google Maps.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <GoogleMapView
        markers={markers}
        center={center}
        zoom={zoom}
        className={className}
      />
    </APIProvider>
  );
}
