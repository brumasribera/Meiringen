import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { fileURLToPath } from "node:url";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
  if (match) env[match[1]] = match[2];
}

const client = new pg.Client({ connectionString: env.POSTGRES_URL_NON_POOLING });
await client.connect();
const { rows } = await client.query(
  "select slug, name, website_url, source_url from public.organizations order by name"
);
await client.end();

const missing = rows.filter((r) => !r.website_url);
console.log(`Total: ${rows.length}, missing website: ${missing.length}\n`);
for (const row of missing) {
  console.log(`${row.slug}\t${row.name}`);
}
