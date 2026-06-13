import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getInterestCount(eventId: string) {
  try {
    const supabase = await createServiceClient();
    const { count, error } = await supabase
      .from("event_interests")
      .select("event_id", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error("getInterestCount:", error);
    return 0;
  }
}

async function getAuthedSupabase() {
  const supabase = await createClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Auth is not configured." }, { status: 500 }) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Please sign in first." }, { status: 401 }),
    };
  }

  return { supabase, user };
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const { supabase, user, error } = await getAuthedSupabase();
  if (error || !supabase || !user) return error;

  const { error: upsertError } = await supabase.from("event_interests").upsert(
    {
      event_id: eventId,
      user_id: user.id,
    },
    { onConflict: "user_id,event_id" }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    interested: true,
    interestCount: await getInterestCount(eventId),
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const { supabase, user, error } = await getAuthedSupabase();
  if (error || !supabase || !user) return error;

  const { error: deleteError } = await supabase
    .from("event_interests")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({
    interested: false,
    interestCount: await getInterestCount(eventId),
  });
}
