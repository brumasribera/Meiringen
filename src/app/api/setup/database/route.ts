import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import pg from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const migrationFiles = [
  "0001_schema.sql",
  "0002_rls.sql",
  "0004_meiringen_organizations.sql",
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

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const applied: string[] = [];

  try {
    await client.connect();

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      applied.push(file);
    }

    const { rows } = await client.query(
      "select count(*)::int as organizations, (select count(*)::int from public.events) as events"
    );

    return NextResponse.json({
      ok: true,
      applied,
      organizations: rows[0]?.organizations ?? 0,
      events: rows[0]?.events ?? 0,
    });
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
