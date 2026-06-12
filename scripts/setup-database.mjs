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
  "0005_organization_localities.sql",
  "0006_org_descriptions_logos.sql",
  "0007_map_usage.sql",
  "0008_agenda_recurrence.sql",
];

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

function getDatabaseUrl(env) {
  const candidates = [
    env.POSTGRES_URL_NON_POOLING,
    env.POSTGRES_URL,
    env.DATABASE_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.includes("supa=base-pooler")) continue;
    return candidate;
  }

  if (env.POSTGRES_HOST && env.POSTGRES_USER && env.POSTGRES_PASSWORD) {
    const database = env.POSTGRES_DATABASE || "postgres";
    return `postgres://${env.POSTGRES_USER}:${encodeURIComponent(env.POSTGRES_PASSWORD)}@${env.POSTGRES_HOST}:5432/${database}?sslmode=require`;
  }

  return null;
}

async function tableExists(client, table) {
  const { rows } = await client.query("select to_regclass($1) as regclass", [
    `public.${table}`,
  ]);
  return Boolean(rows[0]?.regclass);
}

async function runMigration(client, fileName) {
  const sql = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
  console.log(`Running ${fileName}...`);
  await client.query(sql);
  console.log(`Done ${fileName}`);
}

async function main() {
  const env = {
    ...process.env,
    ...loadEnvFile(path.join(root, ".env.local")),
  };

  const dbUrl = getDatabaseUrl(env);
  if (!dbUrl) {
    throw new Error(
      "No database URL found. Run `vercel env pull .env.local --yes` after Supabase is connected."
    );
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined,
    },
  });

  await client.connect();
  try {
    const hasSchema = await tableExists(client, "organizations");
    const filesToRun = hasSchema
      ? [
          "0005_organization_localities.sql",
          "0006_org_descriptions_logos.sql",
          "0007_map_usage.sql",
          "0008_agenda_recurrence.sql",
        ]
      : migrationFiles;

    for (const file of filesToRun) {
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
