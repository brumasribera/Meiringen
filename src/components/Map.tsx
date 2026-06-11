"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MarkerData = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  href?: string;
};

type Props = {
  markers: MarkerData[];
  center?: [number, number];
  zoom?: number;
  className?: string;
};

export function Map({ markers, center, zoom = 12, className = "h-80" }: Props) {
  const defaultCenter: [number, number] = center ?? [
    markers[0]?.latitude ?? 46.7275,
    markers[0]?.longitude ?? 8.1875,
  ];

  if (markers.length === 0) return null;

  return (
    <div className={`overflow-hidden rounded-2xl border border-border ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={icon}>
            <Popup>
              <strong>{m.name}</strong>
              {m.href && (
                <div className="mt-1">
                  <a href={m.href} className="text-primary underline">
                    Details
                  </a>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
