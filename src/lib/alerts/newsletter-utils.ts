import type { Event, NewsletterPreferences } from "@/lib/types";
import type { AlertFrequency } from "@/lib/constants";

export function matchEventsForUser(
  events: Event[],
  prefs: Pick<
    NewsletterPreferences,
    "categories" | "organization_ids" | "languages"
  >,
): Event[] {
  return events.filter((event) => {
    if (
      prefs.categories.length > 0 &&
      !prefs.categories.includes(event.category)
    ) {
      return false;
    }
    if (
      prefs.organization_ids.length > 0 &&
      event.organization_id &&
      !prefs.organization_ids.includes(event.organization_id)
    ) {
      return false;
    }
    if (
      prefs.languages.length > 0 &&
      event.language &&
      !prefs.languages.includes(event.language)
    ) {
      return false;
    }
    return true;
  });
}

export function eventWindowDays(frequency: AlertFrequency): number {
  return frequency === "weekly" ? 14 : 30;
}

export function shouldSendAlertToday(
  pref: Pick<NewsletterPreferences, "frequency" | "last_sent_at" | "active">,
  today = new Date(),
): boolean {
  if (!pref.active) return false;

  const lastSent = pref.last_sent_at ? new Date(pref.last_sent_at) : null;
  const daysSinceLast = lastSent
    ? (today.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
    : null;

  if (pref.frequency === "weekly") {
    if (daysSinceLast === null) return today.getDay() === 1;
    return daysSinceLast >= 7;
  }

  if (daysSinceLast === null) return today.getDate() === 1;
  return today.getDate() === 1 || daysSinceLast >= 28;
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\s+/g, "");
  return raw?.replace(/\/$/, "") ?? "https://www.meiringen.life";
}

export function buildManageUrl(token: string, _locale: string): string {
  return `${getSiteUrl()}/api/alerts/manage?token=${encodeURIComponent(
    token,
  )}&action=open`;
}

export function buildUnsubscribeUrl(token: string, _locale: string): string {
  return `${getSiteUrl()}/api/alerts/manage?token=${encodeURIComponent(
    token,
  )}&action=unsubscribe`;
}
