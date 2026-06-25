import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export const ORG_COVER_BUCKET = "org-covers";
export const ORG_COVER_PUBLIC_DIR = "/brand/org-covers";
const ORG_COVER_FILESYSTEM_DIR = path.join(
  process.cwd(),
  "public",
  "brand",
  "org-covers"
);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function isLocalOrgCoverStorage(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getOrgCoverExtension(file: File): string | null {
  const mimeExtension = MIME_TO_EXTENSION[file.type.toLowerCase()];
  if (mimeExtension) return mimeExtension;

  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  return null;
}

export function buildOrgCoverFileName(slug: string, extension: string): string {
  const safeSlug = slugify(slug).replace(/[^a-z0-9-]/g, "");
  const suffix = Date.now().toString(36);
  return `${safeSlug}-${suffix}.cover.${extension}`;
}

export async function persistOrgCoverFile(options: {
  file: File;
  orgSlug: string;
}): Promise<{ imageUrl: string }> {
  const extension = getOrgCoverExtension(options.file);
  if (!extension) {
    throw new Error("Unsupported image type");
  }

  const fileName = buildOrgCoverFileName(options.orgSlug, extension);
  const bytes = Buffer.from(await options.file.arrayBuffer());

  if (isLocalOrgCoverStorage()) {
    await mkdir(ORG_COVER_FILESYSTEM_DIR, { recursive: true });
    await writeFile(path.join(ORG_COVER_FILESYSTEM_DIR, fileName), bytes);
    return { imageUrl: `${ORG_COVER_PUBLIC_DIR}/${fileName}` };
  }

  const supabase = await createServiceClient();
  const upload = await supabase.storage.from(ORG_COVER_BUCKET).upload(fileName, bytes, {
    contentType: options.file.type || "application/octet-stream",
    upsert: true,
  });

  if (upload.error) {
    throw upload.error;
  }

  const { data } = supabase.storage.from(ORG_COVER_BUCKET).getPublicUrl(fileName);
  return { imageUrl: data.publicUrl };
}
