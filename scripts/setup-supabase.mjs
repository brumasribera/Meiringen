import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

const MARKETPLACE_URL =
  "https://vercel.com/api/marketplace/cli?teamId=team_3CdrgYn5sDZVnZPpWoNG1CrB&integrationId=oac_VqOgBHqhEoFTPzGkPd7L0iH6&productId=iap_zhE90cEUeefrTQf8&projectId=prj_MASXoY0t7RWuA0K2ycA6pgL0k88F&cmd=add";

function run(command, args, { input } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    input,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`.trim()
    );
  }
  return `${result.stdout}${result.stderr}`;
}

function hasSupabaseEnv(output) {
  return /SUPABASE|POSTGRES_URL|NEXT_PUBLIC_SUPABASE_URL/.test(output);
}

function ensureExtraVercelEnv() {
  const siteUrl = "https://www.meiringen.life";
  const cronSecret = crypto.randomBytes(32).toString("hex");

  for (const target of ["production", "preview", "development"]) {
    run("cmd", [
      "/c",
      `echo ${siteUrl}| vercel env add NEXT_PUBLIC_SITE_URL ${target} --force`,
    ]);
    run("cmd", [
      "/c",
      `echo ${cronSecret}| vercel env add CRON_SECRET ${target} --force --sensitive`,
    ]);
  }
}

async function waitForSupabaseEnv(maxAttempts = 60, delayMs = 10000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const output = run("vercel", ["env", "ls"]);
    if (hasSupabaseEnv(output)) {
      console.log(`Supabase env vars detected (attempt ${attempt}).`);
      return;
    }
    console.log(`Waiting for Supabase on Vercel (${attempt}/${maxAttempts})...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(
    "Supabase is not connected yet. Complete the Vercel Marketplace install in your browser, then rerun: npm run setup:supabase"
  );
}

async function main() {
  console.log("Meiringen Supabase setup");
  console.log("If the browser is not open, use this URL:");
  console.log(MARKETPLACE_URL);

  if (process.platform === "win32") {
    spawnSync("cmd", ["/c", "start", "", MARKETPLACE_URL], {
      cwd: root,
      shell: false,
    });
  }

  await waitForSupabaseEnv();

  console.log("Pulling env vars from Vercel...");
  run("vercel", ["env", "pull", ".env.local", "--yes"]);

  console.log("Adding site URL and cron secret on Vercel...");
  ensureExtraVercelEnv();
  run("vercel", ["env", "pull", ".env.local", "--yes"]);

  console.log("Running database migrations...");
  run("node", ["scripts/setup-database.mjs"]);

  console.log("Setup complete.");
  console.log("- Local env: .env.local");
  console.log("- Production: https://www.meiringen.life/de/organizations");
  console.log("Redeploy on Vercel if organizations are still empty.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
