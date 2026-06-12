export type MapMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  href?: string;
  imageUrl?: string | null;
};

export type MapProviderStatus = {
  provider: "google" | "leaflet";
  usage: number;
  limit: number;
  month: string;
  reason?: "no_api_key" | "limit_reached" | "tracking_unavailable";
};
