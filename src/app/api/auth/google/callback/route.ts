import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { localeCookieMaxAge, localeCookieName } from "@/i18n/constants";
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  getGoogleOAuthConfig,
} from "@/lib/google-oauth";
import { createSessionFromGoogleUser } from "@/lib/google-session";

const STATE_COOKIE = "google_oauth_state";
const NEXT_COOKIE = "google_oauth_next";

function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/de";
  }
  return value;
}

export async function GET(request: Request) {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/de/login?error=google_not_configured", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const oauthError = searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/de/login?error=${encodeURIComponent(oauthError)}`, origin)
    );
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const next = safeNextPath(cookieStore.get(NEXT_COOKIE)?.value);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/de/login?error=invalid_oauth_state", origin));
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const token = await exchangeGoogleCode({
      code,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri,
    });
    const user = await fetchGoogleUserInfo(token.access_token);
    const { preferredLocale } = await createSessionFromGoogleUser(user);

    const response = NextResponse.redirect(new URL(next, origin));
    if (preferredLocale) {
      response.cookies.set(localeCookieName, preferredLocale, {
        maxAge: localeCookieMaxAge,
        path: "/",
        sameSite: "lax",
      });
    }
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(NEXT_COOKIE);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "google_sign_in_failed";
    return NextResponse.redirect(
      new URL(`/de/login?error=${encodeURIComponent(message)}`, origin)
    );
  }
}
