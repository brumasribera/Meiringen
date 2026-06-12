import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { CATEGORIES, CONTENT_LANGUAGES } from "@/lib/constants";
import type { AlertFrequency } from "@/lib/constants";
import type { Category, ContentLanguage } from "@/lib/constants";
import {
  isValidEmail,
  upsertAlertSubscription,
} from "@/lib/alerts/service";
import { buildManageUrl } from "@/lib/alerts/newsletter-utils";
import { buildWelcomeEmailHtml } from "@/lib/email/alert-template";
import { getFromEmail } from "@/lib/email/config";

function parseCategories(value: unknown): Category[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Category =>
    CATEGORIES.includes(item as Category)
  );
}

function parseLanguages(value: unknown): ContentLanguage[] {
  if (!Array.isArray(value)) return ["de"];
  const parsed = value.filter((item): item is ContentLanguage =>
    CONTENT_LANGUAGES.includes(item as ContentLanguage)
  );
  return parsed.length > 0 ? parsed : ["de"];
}

function parseFrequency(value: unknown): AlertFrequency {
  return value === "weekly" ? "weekly" : "monthly";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const locale = String(body.locale ?? "de").slice(0, 5);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const subscription = await upsertAlertSubscription(supabase, {
      email,
      frequency: parseFrequency(body.frequency),
      categories: parseCategories(body.categories),
      languages: parseLanguages(body.languages),
      locale,
      userId: body.userId ?? null,
      organizationIds: Array.isArray(body.organizationIds)
        ? body.organizationIds.filter((id: unknown) => typeof id === "string")
        : undefined,
    });

    let emailSent = false;
    let emailError: string | null = null;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = buildWelcomeEmailHtml({
        locale: subscription.locale,
        manageToken: subscription.manage_token,
        frequency: subscription.frequency,
      });

      const { error } = await resend.emails.send({
        from: getFromEmail(),
        to: subscription.email,
        subject:
          locale === "de"
            ? "Meiringen.life — Event-Alerts aktiviert"
            : "Meiringen.life — event alerts activated",
        html,
      });

      if (error) {
        emailError = error.message;
        console.error("alerts/subscribe resend:", error);
      } else {
        emailSent = true;
      }
    } else {
      emailError = "RESEND_API_KEY missing";
    }

    return NextResponse.json({
      ok: true,
      emailSent,
      emailError,
      manageUrl: `/${subscription.locale}/alerts/manage?token=${subscription.manage_token}`,
      manageUrlFull: buildManageUrl(
        subscription.manage_token,
        subscription.locale
      ),
    });
  } catch (error) {
    console.error("alerts/subscribe:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Subscribe failed" },
      { status: 500 }
    );
  }
}
