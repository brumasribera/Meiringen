import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { isAdminEmail } from "@/lib/admin";

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

  if (!user || !isAdminEmail(user.email)) {
    redirect({ href: "/", locale });
  }

  return { user: user!, supabase };
}
