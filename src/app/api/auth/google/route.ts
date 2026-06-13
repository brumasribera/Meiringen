import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, getGoogleOAuthConfig } from "@/lib/google-oauth";

const STATE_COOKIE = "google_oauth_state";
const NEXT_COOKIE = "google_oauth_next";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/de";
  }
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/de/login?error=Google+sign-in+is+not+configured+yet", origin)
    );
  }

  const next = safeNextPath(searchParams.get("next"));
  const state = randomBytes(24).toString("hex");
  const redirectUri = `${origin}/api/auth/google/callback`;
  const response = NextResponse.redirect(
    buildGoogleAuthUrl({
      clientId: config.clientId,
      redirectUri,
      state,
    })
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/",
  };

  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  response.cookies.set(NEXT_COOKIE, next, cookieOptions);
  return response;
}
