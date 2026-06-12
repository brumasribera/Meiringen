import { createServiceClient } from "@/lib/supabase/server";

export type MapProvider = "google" | "leaflet";

export type MapProviderStatus = {
  provider: MapProvider;
  usage: number;
  limit: number;
  month: string;
  reason?: "no_api_key" | "limit_reached" | "tracking_unavailable";
};

export function getGoogleMapsMonthlyLimit(): number {
  const raw = process.env.GOOGLE_MAPS_MONTHLY_LIMIT;
  const parsed = raw ? Number.parseInt(raw, 10) : 500;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 500;
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function reserveGoogleMapLoad(): Promise<MapProviderStatus> {
  const limit = getGoogleMapsMonthlyLimit();
  const month = currentMonthKey();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return { provider: "leaflet", usage: 0, limit, month, reason: "no_api_key" };
  }

  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase.rpc("reserve_google_map_load", {
      p_limit: limit,
    });

    if (error) throw error;

    const payload = data as {
      allowed: boolean;
      usage: number;
      limit: number;
      month: string;
    };

    if (payload.allowed) {
      return {
        provider: "google",
        usage: payload.usage,
        limit: payload.limit,
        month: payload.month,
      };
    }

    return {
      provider: "leaflet",
      usage: payload.usage,
      limit: payload.limit,
      month: payload.month,
      reason: "limit_reached",
    };
  } catch (error) {
    console.error("reserveGoogleMapLoad:", error);
    return {
      provider: "leaflet",
      usage: 0,
      limit,
      month,
      reason: "tracking_unavailable",
    };
  }
}
