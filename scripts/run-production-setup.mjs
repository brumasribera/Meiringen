import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const SITE = "https://meiringen.vercel.app";
const secret = crypto.randomBytes(32).toString("hex");

function run(command, args, input) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    input,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error(`${command} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return `${result.stdout}${result.stderr}`;
}

for (const env of ["production", "preview"]) {
  run("cmd", ["/c", `echo ${secret}| vercel env add CRON_SECRET ${env} --force --sensitive`]);
}

console.log("CRON_SECRET updated on Vercel.");

async function waitForDeploy(maxAttempts = 30) {
  for (let i = 1; i <= maxAttempts; i++) {
    const res = await fetch(`${SITE}/api/setup/database`, { method: "POST" });
    if (res.status !== 404) {
      console.log(`Deploy reachable (attempt ${i}, status ${res.status}).`);
      return;
    }
    console.log(`Waiting for deploy (${i}/${maxAttempts})...`);
    await new Promise((r) => setTimeout(r, 10000));
  }
  throw new Error("Deploy did not become ready in time.");
}

await waitForDeploy();

const migrateRes = await fetch(`${SITE}/api/setup/database`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
});

const body = await migrateRes.json();
console.log("Migration response:", JSON.stringify(body, null, 2));

if (!migrateRes.ok) {
  process.exit(1);
}

const orgRes = await fetch(`${SITE}/de/organizations`);
const html = await orgRes.text();
const hasOrgs = /Musikgesellschaft|Jodlerklub|organizations/i.test(html);
console.log(`Organizations page status: ${orgRes.status}, has content: ${hasOrgs}`);
