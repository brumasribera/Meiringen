/**
 * Configure Supabase Auth (URLs + optional Google provider) via Management API.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/configure-auth.mjs
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... node scripts/configure-auth.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.meiringen.life";
const REDIRECTS = [
  "http://localhost:3000/**",
  `${SITE}/**`,
  "https://meiringen.life/**",
  "https://*.vercel.app/**",
];

function loadProjectRef() {
  for (const file of [".env.development-check", ".env.local", ".env.production-check"]) {
    const envPath = path.join(root, file);
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/NEXT_PUBLIC_SUPABASE_URL="https:\/\/([^.]+)\.supabase\.co"/);
    if (match) return match[1];
  }
  throw new Error("Could not resolve Supabase project ref from env files");
}

function loadEnvValue(name) {
  for (const file of [".env.local", ".env.development-check", ".env.production-check"]) {
    const envPath = path.join(root, file);
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(new RegExp(`^${name}="(.*)"$`, "m"));
    if (match) return match[1].trim();
  }
  return process.env[name]?.trim();
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN is required. Create one at https://supabase.com/dashboard/account/tokens"
    );
  }

  const ref = loadProjectRef();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const currentRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    headers,
  });
  if (!currentRes.ok) {
    throw new Error(`GET auth config failed: ${currentRes.status} ${await currentRes.text()}`);
  }
  const current = await currentRes.json();
  console.log("Current site_url:", current.site_url);
  console.log("Current google enabled:", current.external_google_enabled);

  const patchBody = {
    site_url: SITE,
    additional_redirect_urls: REDIRECTS,
  };

  const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ?? loadEnvValue("GOOGLE_OAUTH_CLIENT_ID");
  const googleClientSecret =
    process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() ?? loadEnvValue("GOOGLE_OAUTH_CLIENT_SECRET");

  if (googleClientId && googleClientSecret) {
    patchBody.external_google_enabled = true;
    patchBody.external_google_client_id = googleClientId;
    patchBody.external_google_secret = googleClientSecret;
    console.log("Enabling Supabase Google provider...");
  } else {
    console.log("Skipping Google provider enable (GOOGLE_OAUTH_CLIENT_ID/SECRET not set).");
  }

  const patchRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(patchBody),
  });
  const body = await patchRes.json();
  if (!patchRes.ok) {
    throw new Error(`PATCH auth config failed: ${patchRes.status} ${JSON.stringify(body)}`);
  }

  console.log("Updated site_url:", body.site_url);
  console.log("Updated google enabled:", body.external_google_enabled);
  console.log("Updated redirects:", body.additional_redirect_urls ?? body.uri_allow_list);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
