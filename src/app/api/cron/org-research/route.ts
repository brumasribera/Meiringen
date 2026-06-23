import { NextResponse } from "next/server";
import { syncOrganizationDirectories } from "@/lib/organizations/sync-directories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function verifyCron(request: Request) {
  if (!process.env.CRON_SECRET) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncOrganizationDirectories();
    return NextResponse.json(result);
  } catch (error) {
    console.error("org directory sync:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Organization sync failed" },
      { status: 500 }
    );
  }
}
