/**
 * Set up Google OAuth for meiringen.life.
 *
 * Usage:
 *   node scripts/setup-google-auth.mjs
 *   node scripts/setup-google-auth.mjs --client-id xxx.apps.googleusercontent.com --client-secret GOCSPX-xxx
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/setup-google-auth.mjs --client-id ... --client-secret ...
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.meiringen.life";
const PROJECT_REF = "idzxhzhpsrlchzmfflzs";
const SUPABASE_CALLBACK = `https://${PROJECT_REF}.supabase.co/auth/v1/callback`;
const APP_CALLBACK = `${SITE}/api/auth/google/callback`;

function parseArgs(argv) {
  const args = { clientId: "", clientSecret: "", skipVercel: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--client-id") args.clientId = argv[++i] ?? "";
    if (argv[i] === "--client-secret") args.clientSecret = argv[++i] ?? "";
    if (argv[i] === "--skip-vercel") args.skipVercel = true;
  }
  return args;
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

function setVercelEnv(name, value, target) {
  const sensitiveFlag = target === "development" ? "" : " --sensitive";
  const result = spawnSync(
    "cmd",
    ["/c", `echo ${value}| npx vercel env add ${name} ${target} --force${sensitiveFlag}`],
    { cwd: root, encoding: "utf8", shell: false }
  );
  if (result.status !== 0) {
    throw new Error(`Failed to set ${name} on ${target}: ${result.stderr || result.stdout}`);
  }
}

async function verifyAuth(clientId, clientSecret) {
  process.env.GOOGLE_OAUTH_CLIENT_ID = clientId;
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = clientSecret;
  const result = spawnSync(process.execPath, [path.join(root, "scripts/check-auth.mjs")], {
    cwd: root,
    encoding: "utf8",
  });
  console.log(result.stdout || result.stderr);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log("=== Google OAuth setup for meiringen.life ===\n");
  console.log("Google Cloud OAuth client needs:");
  console.log("  Authorized JavaScript origins:");
  console.log("    http://localhost:3000");
  console.log(`    ${SITE}`);
  console.log("    https://meiringen.life");
  console.log("  Authorized redirect URIs:");
  console.log(`    ${APP_CALLBACK}`);
  console.log(`    ${SUPABASE_CALLBACK}  (optional, for native Supabase OAuth)`);
  console.log("");

  if (!args.clientId || !args.clientSecret) {
    console.log("Create or edit the OAuth client here:");
    openUrl("https://console.cloud.google.com/apis/credentials");
    console.log("Opened Google Cloud Console → Credentials");
    console.log("");
    console.log("Then rerun with:");
    console.log(
      "  node scripts/setup-google-auth.mjs --client-id YOUR_ID.apps.googleusercontent.com --client-secret GOCSPX-xxx"
    );
    process.exit(1);
  }

  if (!args.skipVercel) {
    console.log("Setting Vercel env vars (production, preview, development)...");
    for (const target of ["production", "preview", "development"]) {
      setVercelEnv("GOOGLE_OAUTH_CLIENT_ID", args.clientId, target);
      setVercelEnv("GOOGLE_OAUTH_CLIENT_SECRET", args.clientSecret, target);
    }
    console.log("Pulling updated env...");
    spawnSync("npx", ["vercel", "env", "pull", ".env.local", "--yes"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
  }

  if (process.env.SUPABASE_ACCESS_TOKEN) {
    console.log("\nEnabling Google in Supabase Auth + updating redirect URLs...");
    spawnSync(process.execPath, [path.join(root, "scripts/configure-auth.mjs")], {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        GOOGLE_OAUTH_CLIENT_ID: args.clientId,
        GOOGLE_OAUTH_CLIENT_SECRET: args.clientSecret,
      },
    });
  } else {
    console.log("\nSUPABASE_ACCESS_TOKEN not set — skipping Supabase provider enable.");
    console.log("Custom app OAuth (/api/auth/google) will still work once deployed.");
    console.log("Optional: create token at https://supabase.com/dashboard/account/tokens");
  }

  console.log("\nVerifying Supabase provider status...");
  await verifyAuth(args.clientId, args.clientSecret);

  console.log("\nDeploy to production:");
  console.log("  npx vercel deploy --prod --yes");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
