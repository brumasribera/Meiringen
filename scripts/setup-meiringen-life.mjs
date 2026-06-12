/**
 * Fix Vercel env vars and optionally add RESEND_API_KEY.
 * Usage:
 *   node scripts/setup-meiringen-life.mjs
 *   node scripts/setup-meiringen-life.mjs --resend-key re_xxxx
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.meiringen.life";
const FROM = "Meiringen Alerts <alerts@meiringen.life>";

function run(command, args, { input, sensitive = false } = {}) {
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

function setEnv(name, value, targets, { sensitive = false } = {}) {
  for (const target of targets) {
    const args = ["env", "add", name, target, "--force"];
    if (sensitive) args.push("--sensitive");
    run("npx", ["vercel", ...args], { input: value });
    console.log(`Set ${name} on ${target}`);
  }
}

async function testSite() {
  const response = await fetch(`${SITE}/de`);
  if (!response.ok) throw new Error(`Site HTTP ${response.status}`);
  console.log(`Site OK: ${SITE}/de (${response.status})`);
}

async function testSubscribe(base) {
  const response = await fetch(`${base}/api/alerts/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `domain-test-${Date.now()}@example.com`,
      frequency: "weekly",
      categories: ["culture"],
      languages: ["de"],
      locale: "de",
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  console.log(
    `Subscribe OK: emailSent=${data.emailSent} manage=${data.manageUrlFull ?? data.manageUrl}`
  );
  if (!data.emailSent) {
    console.log(`Email note: ${data.emailError ?? "not sent"}`);
  }
  return data;
}

async function testResendDirect(apiKey) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: ["brumasribera@gmail.com"],
      subject: "Meiringen.life — domain test",
      html: "<p>Resend + meiringen.life is working.</p>",
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  console.log(`Resend direct OK: id=${data.id}`);
}

async function main() {
  const keyArg = process.argv.find((a) => a.startsWith("re_"));
  const resendKey = keyArg ?? process.env.RESEND_API_KEY;

  console.log("Updating Vercel env for meiringen.life...");
  setEnv("NEXT_PUBLIC_SITE_URL", SITE, ["production", "preview", "development"]);
  setEnv("RESEND_FROM_EMAIL", FROM, ["production", "preview", "development"]);

  if (resendKey) {
    setEnv("RESEND_API_KEY", resendKey, ["production", "preview", "development"], {
      sensitive: true,
    });
  } else {
    console.log(
      "RESEND_API_KEY not provided. Create one at resend.com/api-keys or connect Vercel in Resend Integrations."
    );
  }

  console.log("\nTesting site...");
  await testSite();

  console.log("\nTesting subscribe API on production...");
  await testSubscribe(SITE);

  if (resendKey) {
    console.log("\nTesting Resend API directly...");
    await testResendDirect(resendKey);
    console.log("\nRedeploy with: npx vercel deploy --prod --yes");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
