import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getFollowerCount(organizationId: string) {
  try {
    const supabase = await createServiceClient();
    const { count, error } = await supabase
      .from("organization_follows")
      .select("organization_id", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error("getFollowerCount:", error);
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
  context: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await context.params;
  const { supabase, user, error } = await getAuthedSupabase();
  if (error || !supabase || !user) return error;

  const { error: upsertError } = await supabase.from("organization_follows").upsert(
    {
      organization_id: organizationId,
      user_id: user.id,
    },
    { onConflict: "user_id,organization_id" }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    following: true,
    followerCount: await getFollowerCount(organizationId),
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await context.params;
  const { supabase, user, error } = await getAuthedSupabase();
  if (error || !supabase || !user) return error;

  const { error: deleteError } = await supabase
    .from("organization_follows")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({
    following: false,
    followerCount: await getFollowerCount(organizationId),
  });
}
