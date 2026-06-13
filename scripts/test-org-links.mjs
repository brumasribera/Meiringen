import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { fileURLToPath } from "node:url";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE = process.env.TEST_BASE ?? "https://www.meiringen.life";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
  if (match) env[match[1]] = match[2];
}

async function checkUrl(url) {
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  return {
    status: res.status,
    ok:
      res.ok &&
      !html.includes("This page couldn") &&
      !html.includes("Application error") &&
      !html.includes('data-next-error="1"'),
    finalUrl: res.url,
  };
}

const client = new pg.Client({ connectionString: env.POSTGRES_URL_NON_POOLING });
await client.connect();
const { rows } = await client.query(
  "select slug, name, languages, latitude, longitude from public.organizations order by name"
);
await client.end();

console.log(`Testing ${rows.length} organizations on ${BASE}\n`);

const failures = [];
for (const org of rows) {
  const url = `${BASE}/en/organizations/${org.slug}`;
  const result = await checkUrl(url);
  const html = await (await fetch(url)).text();
  const hasName = html.includes(org.name) || html.includes(org.name.split(" ")[0]);
  if (!result.ok || !hasName) {
    failures.push({ org, result, hasName });
    console.log(`✗ ${org.slug} (${org.name}) status=${result.status} hasName=${hasName}`);
  } else {
    console.log(`✓ ${org.slug}`);
  }
}

console.log(`\n${rows.length - failures.length}/${rows.length} passed`);
if (failures.length) {
  console.log("\nFailures:", failures.slice(0, 5));
  process.exit(1);
}
