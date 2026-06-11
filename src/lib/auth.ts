import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";

export async function requireAdmin(locale: string) {
  const supabase = await createClient();
  if (!supabase) {
    redirect({ href: "/", locale });
    throw new Error("Supabase is not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") {
    redirect({ href: "/", locale });
  }

  return { user: user!, supabase };
}
