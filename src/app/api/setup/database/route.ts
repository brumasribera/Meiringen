import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import pg from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schemaFiles = ["0001_schema.sql", "0002_rls.sql"];
const seedFiles = [
  "0004_meiringen_organizations.sql",
  "0005_organization_localities.sql",
  "0006_org_descriptions_logos.sql",
];

function verifySetupRequest(request: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.SETUP_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

function getDatabaseUrl() {
  return (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    null
  );
}

async function tableExists(client: pg.Client, table: string) {
  const { rows } = await client.query(
    "select to_regclass($1) as regclass",
    [`public.${table}`]
  );
  return Boolean(rows[0]?.regclass);
}

async function getCounts(client: pg.Client) {
  const { rows } = await client.query(
    "select (select count(*)::int from public.organizations) as org_count, (select count(*)::int from public.events) as event_count"
  );
  return {
    organizations: rows[0]?.org_count ?? 0,
    events: rows[0]?.event_count ?? 0,
  };
}

function createPgClient(dbUrl: string) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  return new pg.Client({ connectionString: dbUrl });
}

export async function GET() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return NextResponse.json({ configured: false, organizations: 0, events: 0 });
  }

  const client = createPgClient(dbUrl);
  try {
    await client.connect();
    const hasSchema = await tableExists(client, "organizations");
    if (!hasSchema) {
      return NextResponse.json({ configured: true, schema: false, organizations: 0, events: 0 });
    }
    const counts = await getCounts(client);
    return NextResponse.json({ configured: true, schema: true, ...counts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status check failed" },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function POST(request: Request) {
  if (!verifySetupRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return NextResponse.json(
      { error: "No database URL configured" },
      { status: 500 }
    );
  }

  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const applied: string[] = [];
  const client = createPgClient(dbUrl);

  try {
    await client.connect();
    const hasSchema = await tableExists(client, "organizations");

    if (!hasSchema) {
      for (const file of schemaFiles) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        await client.query(sql);
        applied.push(file);
      }
    }

    for (const file of seedFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      applied.push(file);
    }

    const counts = await getCounts(client);
    return NextResponse.json({ ok: true, applied, ...counts });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Migration failed",
        applied,
      },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}
