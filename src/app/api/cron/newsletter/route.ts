import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { matchEventsForUser, buildNewsletterHtml } from "@/lib/newsletter";
import type { Event, NewsletterPreferences } from "@/lib/types";

function verifyCron(request: Request) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run newsletter only on the 1st of each month (Vercel Hobby: daily cron max)
  const today = new Date();
  if (today.getDate() !== 1) {
    return NextResponse.json({ skipped: true, reason: "Not first of month" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = await createServiceClient();

  const rangeEnd = new Date();
  rangeEnd.setDate(rangeEnd.getDate() + 30);

  const { data: allEvents } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("start_date", new Date().toISOString())
    .lte("start_date", rangeEnd.toISOString())
    .order("start_date");

  const { data: preferences } = await supabase
    .from("newsletter_preferences")
    .select("*");

  let sent = 0;
  let failed = 0;

  for (const pref of preferences ?? []) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", pref.user_id)
        .single();

      const email = profile?.email;
      if (!email) continue;

      const matched = matchEventsForUser(
        (allEvents ?? []) as Event[],
        pref as NewsletterPreferences
      );

      if (matched.length === 0) continue;

      const locale = pref.languages?.[0] ?? "de";
      const html = buildNewsletterHtml(matched, locale);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "newsletter@meiringen.org",
        to: email,
        subject: `Meiringen.org — ${matched.length} upcoming events`,
        html,
      });

      sent++;
    } catch (err) {
      console.error("Newsletter send failed:", err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
