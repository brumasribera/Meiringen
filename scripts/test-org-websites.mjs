import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[line.slice(0, idx).trim()] = value;
  }
  return env;
}

async function hasDns(hostname) {
  try {
    await dns.lookup(hostname);
    return true;
  } catch {
    return false;
  }
}

async function checkUrl(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      let res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "Meiringen.life/1.0 (website audit)" },
      });
      if ([403, 405, 501].includes(res.status)) {
        res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { "User-Agent": "Meiringen.life/1.0 (website audit)" },
        });
      }
      const reachable = res.ok || res.status === 403;
      return {
        ok: reachable,
        status: res.status,
        finalUrl: res.url,
        attempt: attempt + 1,
      };
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      return { ok: false, status: 0, error: err.message, attempt: attempt + 1 };
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, status: 0, error: "unknown" };
}

async function main() {
  const env = { ...process.env, ...loadEnvFile(path.join(root, ".env.local")) };
  const dbUrl =
    env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || env.DATABASE_URL;
  if (!dbUrl) throw new Error("No database URL");

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined,
    },
  });
  await client.connect();

  const { rows } = await client.query(`
    select slug, name, website_url
    from public.organizations
    order by slug
  `);
  await client.end();

  console.log(`Testing ${rows.length} organization websites...\n`);

  const passed = [];
  const failed = [];
  const dnsOnly = [];

  for (const row of rows) {
    const result = await checkUrl(row.website_url);
    const label = `${row.slug}`;
    if (result.ok) {
      passed.push({ ...row, ...result });
      console.log(`OK  ${result.status}  ${label}`);
    } else {
      const hostname = new URL(row.website_url).hostname;
      const dnsOk = await hasDns(hostname);
      if (dnsOk && result.error?.includes("fetch failed")) {
        dnsOnly.push({ ...row, ...result, hostname });
        console.log(`DNS ${hostname} (timeout from runner)  ${label}`);
      } else {
        failed.push({ ...row, ...result });
        const detail = result.error || `HTTP ${result.status}`;
        console.log(`FAIL ${detail}  ${label}`);
        console.log(`     ${row.website_url}`);
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n--- Summary ---`);
  console.log(`HTTP OK: ${passed.length}/${rows.length}`);
  console.log(`DNS OK (timeout from this network): ${dnsOnly.length}`);
  console.log(`Broken: ${failed.length}/${rows.length}`);

  if (dnsOnly.length) {
    console.log(`\nReachable by DNS only (Swiss municipal hosting — likely fine in browser):`);
    for (const d of dnsOnly) {
      console.log(`- ${d.name} (${d.slug})`);
      console.log(`  ${d.website_url}`);
    }
  }

  if (failed.length) {
    console.log(`\nFailed sites:`);
    for (const f of failed) {
      console.log(`- ${f.name} (${f.slug})`);
      console.log(`  ${f.website_url}`);
      console.log(`  ${f.error || `HTTP ${f.status}`}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
