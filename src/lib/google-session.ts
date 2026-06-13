import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { GoogleUserInfo } from "@/lib/google-oauth";
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";

async function ensureGoogleUser(user: GoogleUserInfo) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role is not configured");
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const metadata = {
    full_name: user.name,
    avatar_url: user.picture,
    picture: user.picture,
    provider: "google",
  };

  const { error: createError } = await admin.auth.admin.createUser({
    email: user.email,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: {
      provider: "google",
      providers: ["google"],
    },
  });

  if (
    createError &&
    !createError.message.toLowerCase().includes("already") &&
    !createError.message.toLowerCase().includes("registered")
  ) {
    throw createError;
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
    options: { data: metadata },
  });

  if (linkError || !linkData.properties.hashed_token) {
    throw linkError ?? new Error("Failed to generate Supabase login link");
  }

  return linkData.properties.hashed_token;
}

export async function createSessionFromGoogleUser(user: GoogleUserInfo) {
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase is not configured");
  }

  const tokenHash = await ensureGoogleUser(user);
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  if (error || !data.session) {
    throw error ?? new Error("Failed to create Supabase session");
  }

  return data.session;
}
