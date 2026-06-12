import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, ContentLanguage, AlertFrequency } from "@/lib/constants";
import type { NewsletterPreferences } from "@/lib/types";
import { buildManageUrl } from "./newsletter-utils";

export type AlertSubscriptionInput = {
  email: string;
  frequency: AlertFrequency;
  categories: Category[];
  languages: ContentLanguage[];
  locale: string;
  userId?: string | null;
  organizationIds?: string[];
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function getAlertByToken(
  supabase: SupabaseClient,
  token: string
): Promise<NewsletterPreferences | null> {
  const { data, error } = await supabase
    .from("newsletter_preferences")
    .select("*")
    .eq("manage_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as NewsletterPreferences | null) ?? null;
}

export async function getAlertByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<NewsletterPreferences | null> {
  const { data, error } = await supabase
    .from("newsletter_preferences")
    .select("*")
    .ilike("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as NewsletterPreferences | null) ?? null;
}

export async function upsertAlertSubscription(
  supabase: SupabaseClient,
  input: AlertSubscriptionInput
): Promise<NewsletterPreferences> {
  const email = normalizeEmail(input.email);
  const existing = await getAlertByEmail(supabase, email);

  const payload = {
    email,
    user_id: input.userId ?? existing?.user_id ?? null,
    frequency: input.frequency,
    categories: input.categories,
    organization_ids: input.organizationIds ?? existing?.organization_ids ?? [],
    languages: input.languages.length > 0 ? input.languages : ["de"],
    locale: input.locale,
    active: true,
    manage_token: existing?.manage_token ?? randomBytes(32).toString("hex"),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("newsletter_preferences")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as NewsletterPreferences;
  }

  const { data, error } = await supabase
    .from("newsletter_preferences")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as NewsletterPreferences;
}

export async function updateAlertByToken(
  supabase: SupabaseClient,
  token: string,
  updates: Partial<
    Pick<
      NewsletterPreferences,
      "frequency" | "categories" | "organization_ids" | "languages" | "locale" | "active"
    >
  >
): Promise<NewsletterPreferences | null> {
  const { data, error } = await supabase
    .from("newsletter_preferences")
    .update(updates)
    .eq("manage_token", token)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as NewsletterPreferences | null) ?? null;
}

export async function deactivateAlertByToken(
  supabase: SupabaseClient,
  token: string
): Promise<void> {
  const { error } = await supabase
    .from("newsletter_preferences")
    .update({ active: false })
    .eq("manage_token", token);

  if (error) throw new Error(error.message);
}

export async function markAlertSent(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("newsletter_preferences")
    .update({ last_sent_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export function publicAlertView(pref: NewsletterPreferences) {
  return {
    email: pref.email,
    frequency: pref.frequency,
    categories: pref.categories,
    organization_ids: pref.organization_ids,
    languages: pref.languages,
    locale: pref.locale,
    active: pref.active,
    manageUrl: buildManageUrl(pref.manage_token, pref.locale),
  };
}
