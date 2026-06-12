import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { CATEGORIES, CONTENT_LANGUAGES } from "@/lib/constants";
import type { AlertFrequency } from "@/lib/constants";
import type { Category, ContentLanguage } from "@/lib/constants";
import {
  deactivateAlertByToken,
  getAlertByToken,
  publicAlertView,
  updateAlertByToken,
} from "@/lib/alerts/service";
import { getSiteUrl } from "@/lib/alerts/newsletter-utils";

function tokenFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("token");
}

function parseCategories(value: unknown): Category[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is Category =>
    CATEGORIES.includes(item as Category)
  );
}

function parseLanguages(value: unknown): ContentLanguage[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is ContentLanguage =>
    CONTENT_LANGUAGES.includes(item as ContentLanguage)
  );
}

export async function GET(request: Request) {
  const token = tokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("action") === "unsubscribe") {
    try {
      const supabase = await createServiceClient();
      const pref = await getAlertByToken(supabase, token);
      if (!pref) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      await deactivateAlertByToken(supabase, token);
      return NextResponse.redirect(
        `${getSiteUrl()}/${pref.locale}/alerts/unsubscribed`,
        303
      );
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed" },
        { status: 500 }
      );
    }
  }

  try {
    const supabase = await createServiceClient();
    const pref = await getAlertByToken(supabase, token);
    if (!pref) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(publicAlertView(pref));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const token = tokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const supabase = await createServiceClient();
    const frequency: AlertFrequency | undefined =
      body.frequency === "weekly" || body.frequency === "monthly"
        ? body.frequency
        : undefined;

    const updated = await updateAlertByToken(supabase, token, {
      frequency,
      categories: parseCategories(body.categories),
      organization_ids: Array.isArray(body.organization_ids)
        ? body.organization_ids.filter((id: unknown) => typeof id === "string")
        : undefined,
      languages: parseLanguages(body.languages),
      locale: typeof body.locale === "string" ? body.locale.slice(0, 5) : undefined,
      active: body.active === false ? false : body.active === true ? true : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(publicAlertView(updated));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const token = tokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const supabase = await createServiceClient();
    const pref = await getAlertByToken(supabase, token);
    if (!pref) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deactivateAlertByToken(supabase, token);
    const redirectUrl = `${getSiteUrl()}/${pref.locale}/alerts/unsubscribed`;
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
