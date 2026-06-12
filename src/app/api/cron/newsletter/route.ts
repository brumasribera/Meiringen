import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import {
  eventWindowDays,
  matchEventsForUser,
  shouldSendAlertToday,
} from "@/lib/alerts/newsletter-utils";
import { buildAlertDigestEmailHtml } from "@/lib/email/alert-template";
import { getFromEmail } from "@/lib/email/config";
import { markAlertSent } from "@/lib/alerts/service";
import type { Event, NewsletterPreferences } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function verifyCron(request: Request) {
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
      const windowDays = eventWindowDays(subscription.frequency);
      const rangeEnd = new Date();
      rangeEnd.setDate(rangeEnd.getDate() + windowDays);

      const { data: allEvents } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .eq("is_recurring_template", false)
        .gte("start_date", new Date().toISOString())
        .lte("start_date", rangeEnd.toISOString())
        .order("start_date");

      const matched = matchEventsForUser(
        (allEvents ?? []) as Event[],
        subscription
      );

      if (matched.length === 0) {
        skipped++;
        continue;
      }

      const locale = subscription.locale || subscription.languages?.[0] || "de";
      const html = buildAlertDigestEmailHtml({
        events: matched,
        locale,
        frequency: subscription.frequency,
        manageToken: subscription.manage_token,
      });

      await resend.emails.send({
        from: getFromEmail(),
        to: subscription.email,
        subject:
          locale === "de"
            ? `Meiringen.life — ${matched.length} Veranstaltungen für dich`
            : `Meiringen.life — ${matched.length} events for you`,
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
