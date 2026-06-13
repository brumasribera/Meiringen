/**
 * Production verification and configuration for meiringen.life
 *
 * Usage:
 *   node scripts/configure-production.mjs
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/configure-production.mjs
 *   node scripts/configure-production.mjs --resend-key re_xxxx
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tls from "node:tls";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.meiringen.life";
const RESEND_INSTALL_URL =
  "https://vercel.com/integrations/resend/new?teamSlug=openhuts&project=meiringen";

function runNode(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${path.basename(script)} failed`);
  }
}

function vercelEnvHas(name) {
  const result = spawnSync("npx", ["vercel", "env", "ls"], {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
  return result.stdout.includes(name);
}

function openUrl(url) {
  if (process.platform === "win32") {
    spawnSync("cmd", ["/c", "start", "", url], { shell: false });
  } else if (process.platform === "darwin") {
    spawnSync("open", [url]);
  } else {
    spawnSync("xdg-open", [url]);
  }
}

async function checkSsl(hostname) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        const validTo = new Date(cert.valid_to);
        const daysLeft = Math.floor((validTo - Date.now()) / (1000 * 60 * 60 * 24));
        resolve({ hostname, validTo, daysLeft, ok: daysLeft > 0 });
      }
    );
    socket.on("error", reject);
  });
}

async function checkSupabaseAuth(supabaseUrl, anonKey) {
  const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: anonKey },
  });
  const settings = settingsRes.ok ? await settingsRes.json() : {};

  const authorizeRes = await fetch(
    `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${SITE}/auth/callback`)}`,
    { headers: { apikey: anonKey } }
  );
  const authorizeBody = authorizeRes.ok ? null : await authorizeRes.json();

  return {
    email: Boolean(settings.external?.email),
    googleEnabled: Boolean(settings.external?.google),
    googleWorks: authorizeRes.ok,
    googleError: authorizeBody?.msg ?? null,
  };
}

function loadDevEnv() {
  const envPath = path.join(root, ".env.local");
  const fallback = path.join(root, ".env.development-check");
  const file = fs.existsSync(envPath) ? envPath : fallback;
  if (!fs.existsSync(file)) return {};
  const vars = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
    if (match) vars[match[1]] = match[2];
  }
  return vars;
}

async function main() {
  console.log("=== Meiringen.life production configure ===\n");

  console.log("1) Vercel env (SITE_URL, RESEND_FROM_EMAIL)...");
  runNode(path.join(root, "scripts/setup-meiringen-life.mjs"), process.argv.slice(2));

  if (!vercelEnvHas("RESEND_API_KEY")) {
    console.log("\n2) RESEND_API_KEY missing on Vercel.");
    console.log("   Opening Resend integration install:", RESEND_INSTALL_URL);
    openUrl(RESEND_INSTALL_URL);
    console.log("   Complete the install in your browser, then rerun this script.");
  } else {
    console.log("\n2) RESEND_API_KEY present on Vercel.");
  }

  if (process.env.SUPABASE_ACCESS_TOKEN) {
    console.log("\n3) Updating Supabase Auth URL configuration...");
    runNode(path.join(root, "scripts/configure-auth.mjs"));
  } else {
    console.log("\n3) Skipping Supabase Auth URL update (SUPABASE_ACCESS_TOKEN not set).");
    console.log("   Create a token at https://supabase.com/dashboard/account/tokens");
    console.log("   Then run: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/configure-auth.mjs");
  }

  console.log("\n4) SSL certificates...");
  for (const host of ["meiringen.life", "www.meiringen.life"]) {
    const ssl = await checkSsl(host);
    console.log(`   ${host}: valid until ${ssl.validTo.toISOString().slice(0, 10)} (${ssl.daysLeft} days)`);
  }

  console.log("\n5) Supabase auth providers...");
  const env = loadDevEnv();
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const auth = await checkSupabaseAuth(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    console.log(`   Email auth: ${auth.email ? "enabled" : "disabled"}`);
    console.log(`   Google provider flag: ${auth.googleEnabled ? "enabled" : "disabled"}`);
    if (!auth.googleWorks) {
      console.log(`   Google OAuth: NOT WORKING (${auth.googleError ?? "unknown"})`);
      console.log("   Enable Google in Supabase → Authentication → Providers");
      console.log("   Add https://www.meiringen.life to Google OAuth authorized origins");
    } else {
      console.log("   Google OAuth: OK");
    }
  } else {
    console.log("   Skipped (pull env with: vercel env pull .env.local --yes)");
  }

  console.log("\n6) Feature tests...");
  runNode(path.join(root, "scripts/test-features.mjs"));

  console.log("\nDone. Redeploy if env vars changed: npx vercel deploy --prod --yes");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
