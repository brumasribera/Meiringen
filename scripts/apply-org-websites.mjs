import fs from "node:fs";
import path from "node:path";
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

async function main() {
  const env = { ...process.env, ...loadEnvFile(path.join(root, ".env.local")) };
  const dbUrl =
    env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || env.DATABASE_URL;
  if (!dbUrl) throw new Error("No database URL");

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const migration = process.argv[2] ?? "0011_fix_dead_org_websites.sql";
  const sql = fs.readFileSync(
    path.join(root, "supabase/migrations", migration),
    "utf8"
  );

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined,
    },
  });
  await client.connect();
  console.log(`Running ${migration}...`);
  await client.query(sql);

  const { rows } = await client.query(`
    select
      count(*) filter (where website_url is null)::int as missing,
      count(*)::int as total
    from public.organizations
  `);
  console.log(`Websites: ${rows[0].total - rows[0].missing}/${rows[0].total} filled (${rows[0].missing} still missing)`);

  const samples = await client.query(`
    select slug, website_url from public.organizations
    where slug in (
      'nordischer-skiclub-oberhasli',
      'kanu-klub-berner-oberland',
      'tauchclub-berner-oberland'
    )
    order by slug
  `);
  for (const row of samples.rows) {
    console.log(`${row.slug}: ${row.website_url}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
