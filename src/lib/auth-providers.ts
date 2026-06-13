import { isGoogleOAuthConfigured } from "@/lib/google-oauth";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

type AuthSettings = {
  external?: Record<string, boolean>;
};

export async function getAuthProviders(): Promise<{
  google: boolean;
  useCustomGoogle: boolean;
  email: boolean;
}> {
  const customGoogle = isGoogleOAuthConfigured();
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    return { google: customGoogle, useCustomGoogle: customGoogle, email: false };
  }

  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return { google: customGoogle, useCustomGoogle: customGoogle, email: false };
    }
    const data = (await response.json()) as AuthSettings;
    const supabaseGoogle = Boolean(data.external?.google);
    return {
      google: true,
      useCustomGoogle: customGoogle || !supabaseGoogle,
      email: Boolean(data.external?.email),
    };
  } catch {
    return { google: customGoogle, useCustomGoogle: customGoogle, email: false };
  }
}
