"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { MapMarker } from "./map-types";

type Props = {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  fallbackReason?: string;
};

const DEFAULT_CENTER: [number, number] = [46.7275, 8.1875];
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], 14);
      return;
    }

    const bounds = L.latLngBounds(
      markers.map((marker) => [marker.latitude, marker.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, markers]);

  return null;
}

function markerIcon(marker: MapMarker) {
  if (marker.imageUrl) {
    const safeUrl = marker.imageUrl.replace(/"/g, "&quot;");
    return L.divIcon({
      className: "org-leaflet-marker",
      html: `<div class="org-leaflet-marker__logo"><img src="${safeUrl}" alt="" /></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -40],
    });
  }

  return L.divIcon({
    className: "org-leaflet-marker",
    html: `<div class="org-leaflet-marker__pin"></div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
}

function fallbackLabel(reason?: string) {
  if (reason === "limit_reached") {
    return "OpenStreetMap fallback — monthly Google Maps limit reached";
  }
  if (reason === "tracking_unavailable") {
    return "OpenStreetMap fallback — usage tracking unavailable";
  }
  return "OpenStreetMap";
}

export function LeafletMapView({
  markers,
  center,
  zoom = 12,
  className = "h-80",
  fallbackReason,
}: Props) {
  const mapCenter: [number, number] = center
    ? center
    : markers[0]
      ? [markers[0].latitude, markers[0].longitude]
      : DEFAULT_CENTER;

  return (
    <div className={`leaflet-map-shell overflow-hidden rounded-2xl border border-border ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        <FitBounds markers={markers} />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={markerIcon(marker)}
          >
            <Popup className="org-leaflet-popup">
              <strong>{marker.name}</strong>
              {marker.href && (
                <div className="mt-1">
                  <a href={marker.href} className="text-primary underline">
                    Details
                  </a>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="leaflet-map-badge">{fallbackLabel(fallbackReason)}</div>
    </div>
  );
}
