import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { persistOrgLogoFile } from "@/lib/org-logo-storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ organizationId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authClient = await createClient();
  const supabase = await createServiceClient();
  const {
    data: { user },
  } = authClient ? await authClient.auth.getUser() : { data: { user: null } };

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { organizationId } = await context.params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File is too large" }, { status: 400 });
  }

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("id", organizationId)
    .single();

  if (orgError || !organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  try {
    const { imageUrl } = await persistOrgLogoFile({
      file,
      orgSlug: organization.slug,
    });

    const { error: updateError } = await supabase
      .from("organizations")
      .update({ image_url: imageUrl })
      .eq("id", organizationId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update logo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
