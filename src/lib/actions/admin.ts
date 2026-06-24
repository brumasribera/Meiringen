"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { isAdminEmail } from "@/lib/admin";

async function ensureAdmin() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  if (!isAdminEmail(user.email)) throw new Error("Forbidden");
  return supabase;
}

export async function saveOrganization(formData: FormData, id?: string) {
  const supabase = await ensureAdmin();
  const name = formData.get("name") as string;
  const payload = {
    name,
    slug: (formData.get("slug") as string) || slugify(name),
    description: (formData.get("description") as string) || null,
    description_en: (formData.get("description_en") as string) || null,
    category: formData.get("category") as string,
    website_url: (formData.get("website_url") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    latitude: formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null,
    longitude: formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null,
    locality: (formData.get("locality") as string) || null,
    languages: ((formData.get("languages") as string) || "")
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean),
    image_url: (formData.get("image_url") as string) || null,
    cover_image_url: (formData.get("cover_image_url") as string) || null,
    cover_image_credit:
      (formData.get("cover_image_credit") as string) || null,
    cover_image_credit_url:
      (formData.get("cover_image_credit_url") as string) || null,
    source_url: (formData.get("source_url") as string) || null,
    status: (formData.get("status") as string) || "published",
    directory_source_url:
      (formData.get("directory_source_url") as string) || null,
  };

  if (id) {
    await supabase.from("organizations").update(payload).eq("id", id);
  } else {
    await supabase.from("organizations").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/admin/organizations");
}

export async function deleteOrganization(id: string) {
  const supabase = await ensureAdmin();
  await supabase.from("organizations").delete().eq("id", id);
  revalidatePath("/admin/organizations");
}

export async function saveEvent(formData: FormData, id?: string) {
  const supabase = await ensureAdmin();
  const title = formData.get("title") as string;
  const payload = {
    organization_id: (formData.get("organization_id") as string) || null,
    title,
    slug: (formData.get("slug") as string) || slugify(title),
    description: (formData.get("description") as string) || null,
    category: formData.get("category") as string,
    start_date: formData.get("start_date") as string,
    end_date: (formData.get("end_date") as string) || null,
    location_name: (formData.get("location_name") as string) || null,
    address: (formData.get("address") as string) || null,
    latitude: formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null,
    longitude: formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null,
    price: (formData.get("price") as string) || null,
    language: (formData.get("language") as string) || null,
    is_recurring: formData.get("is_recurring") === "on",
    recurrence_description:
      (formData.get("recurrence_description") as string) || null,
    source_url: (formData.get("source_url") as string) || null,
    status: (formData.get("status") as string) || "published",
  };

  if (id) {
    await supabase.from("events").update(payload).eq("id", id);
  } else {
    await supabase.from("events").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/admin/events");
}

export async function deleteEvent(id: string) {
  const supabase = await ensureAdmin();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
}

export async function saveScrapingSource(formData: FormData, id?: string) {
  const supabase = await ensureAdmin();
  const payload = {
    name: formData.get("name") as string,
    url: formData.get("url") as string,
    type: (formData.get("type") as string) || "generic",
    active: formData.get("active") === "on",
  };

  if (id) {
    await supabase.from("scraping_sources").update(payload).eq("id", id);
  } else {
    await supabase.from("scraping_sources").insert(payload);
  }

  revalidatePath("/admin/sources");
}

export async function deleteScrapingSource(id: string) {
  const supabase = await ensureAdmin();
  await supabase.from("scraping_sources").delete().eq("id", id);
  revalidatePath("/admin/sources");
}

export async function createOrganizationAction(formData: FormData) {
  await saveOrganization(formData);
}

export async function updateOrganizationAction(id: string, formData: FormData) {
  await saveOrganization(formData, id);
}

export async function createEventAction(formData: FormData) {
  await saveEvent(formData);
}

export async function updateEventAction(id: string, formData: FormData) {
  await saveEvent(formData, id);
}

export async function createSourceAction(formData: FormData) {
  await saveScrapingSource(formData);
}

export async function updateSourceAction(id: string, formData: FormData) {
  await saveScrapingSource(formData, id);
}

export async function deleteOrganizationAction(id: string) {
  await deleteOrganization(id);
}

export async function deleteEventAction(id: string) {
  await deleteEvent(id);
}

export async function deleteSourceAction(id: string) {
  await deleteScrapingSource(id);
}
