import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl()!,
    getSupabaseAnonKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot set cookies; middleware handles refresh.
          }
        },
      },
    }
  );
}

export async function createServiceClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!isSupabaseConfigured() || !serviceRoleKey) {
    throw new Error("Supabase service role is not configured");
  }

  return createServerClient(getSupabaseUrl()!, serviceRoleKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
