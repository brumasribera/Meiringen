import { NextResponse } from "next/server";
import { reserveGoogleMapLoad } from "@/lib/map-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await reserveGoogleMapLoad();
  return NextResponse.json(status);
}
