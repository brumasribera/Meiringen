import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import {
  matchEventsForUser,
  shouldSendAlertToday,
} from "@/lib/alerts/newsletter-utils";
import { getStaticCuratedEvents } from "@/lib/curation/static-events";
import {
  buildAlertDigestEmailHtml,
  getAlertEmailSubject,
} from "@/lib/email/alert-template";
import { mergeEventsByIdentity } from "@/lib/event-dedupe";
import { getFromEmail } from "@/lib/email/config";
import { markAlertSent } from "@/lib/alerts/service";
import type { Event, NewsletterPreferences } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function verifyCron(request: Request) {
  if (!process.env.CRON_SECRET) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: true, reason: "RESEND_API_KEY missing" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = await createServiceClient();
  const today = new Date();

  const { data: preferences } = await supabase
    .from("newsletter_preferences")
    .select("*")
    .eq("active", true);

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const pref of preferences ?? []) {
    const subscription = pref as NewsletterPreferences;
    if (!shouldSendAlertToday(subscription, today)) {
      skipped++;
      continue;
    }

    try {
      const rangeStart = new Date();
      const nextWeekEnd = new Date(rangeStart);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
      const rangeEnd = new Date(rangeStart);
      rangeEnd.setMonth(rangeEnd.getMonth() + 2);
      const rangeStartTime = rangeStart.getTime();
      const nextWeekEndTime = nextWeekEnd.getTime();
      const rangeEndTime = rangeEnd.getTime();

      const { data: allEvents } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .eq("is_recurring_template", false)
        .gte("start_date", rangeStart.toISOString())
        .lte("start_date", rangeEnd.toISOString())
        .order("start_date");

      const organizationIds = subscription.organization_ids ?? [];
      const organizationSlugById = new Map<string, string>();
      const organizationIdBySlug = new Map<string, string>();
      if (organizationIds.length > 0) {
        const { data: organizations } = await supabase
          .from("organizations")
          .select("id, slug")
          .in("id", organizationIds);

        for (const organization of organizations ?? []) {
          organizationSlugById.set(organization.id, organization.slug);
          organizationIdBySlug.set(organization.slug, organization.id);
        }
      }

      const staticEvents = getStaticCuratedEvents().filter((event) => {
        const startTime = new Date(event.start_date).getTime();
        const matchesOrganization =
          organizationIds.length === 0 ||
          Boolean(
            (event.organization_id &&
              organizationIds.includes(event.organization_id)) ||
              (event.organization_slug &&
                organizationSlugById.size > 0 &&
                [...organizationSlugById.values()].includes(
                  event.organization_slug,
                )),
          );

        return (
          event.status === "published" &&
          startTime >= rangeStartTime &&
          startTime <= rangeEndTime &&
          matchesOrganization
        );
      }).map((event) =>
        !event.organization_id &&
        event.organization_slug &&
        organizationIdBySlug.has(event.organization_slug)
          ? {
              ...event,
              organization_id: organizationIdBySlug.get(event.organization_slug)!,
            }
          : event,
      );
      const newsletterEvents = mergeEventsByIdentity(
        staticEvents,
        (allEvents ?? []) as Event[],
      ) as Event[];

      const matched = matchEventsForUser(
        newsletterEvents,
        subscription
      ).sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      );

      if (matched.length === 0) {
        skipped++;
        continue;
      }

      const nextWeekEvents = matched.filter(
        (event) => new Date(event.start_date).getTime() < nextWeekEndTime,
      );
      const laterEvents = matched.filter(
        (event) => new Date(event.start_date).getTime() >= nextWeekEndTime,
      );
      const locale = subscription.locale || subscription.languages?.[0] || "de";
      const html = buildAlertDigestEmailHtml({
        events: matched,
        eventsNextWeek: nextWeekEvents,
        eventsLater: laterEvents.slice(0, 10),
        hasMoreEvents: laterEvents.length > 10,
        locale,
        frequency: subscription.frequency,
        manageToken: subscription.manage_token,
      });

      await resend.emails.send({
        from: getFromEmail(),
        to: subscription.email,
        subject: getAlertEmailSubject(locale, matched.length),
        html,
      });

      await markAlertSent(supabase, subscription.id);
      sent++;
    } catch (err) {
      console.error("Newsletter send failed:", err);
      failed++;
    }
  }

  return NextResponse.json({ sent, skipped, failed });
}
