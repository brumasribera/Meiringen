import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const migrationsDir = path.join(root, "supabase", "migrations");

const migrationFiles = [
  "0001_schema.sql",
  "0002_rls.sql",
  "0004_meiringen_organizations.sql",
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    env[line.slice(0, idx)] = line.slice(idx + 1);
  }
  return env;
}

function getDatabaseUrl(env) {
  return (
    env.POSTGRES_URL_NON_POOLING ||
    env.POSTGRES_URL ||
    env.DATABASE_URL ||
    null
  );
}

async function runMigration(client, fileName) {
  const sql = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
  console.log(`Running ${fileName}...`);
  await client.query(sql);
  console.log(`Done ${fileName}`);
}

async function main() {
  const env = {
    ...loadEnvFile(path.join(root, ".env.local")),
    ...process.env,
  };

  const dbUrl = getDatabaseUrl(env);
  if (!dbUrl) {
    throw new Error(
      "No database URL found. Run `vercel env pull .env.local --yes` after Supabase is connected."
    );
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    for (const file of migrationFiles) {
      await runMigration(client, file);
    }

    const { rows } = await client.query(
      "select count(*)::int as count from public.organizations"
    );
    console.log(`Organizations in database: ${rows[0].count}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
