import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runParser } from "@/lib/scraping/parsers";
function verifyCron(request: Request) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const { data: sources, error } = await supabase
    .from("scraping_sources")
    .select("*")
    .eq("active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let imported = 0;
  let skipped = 0;

  for (const source of sources ?? []) {
    try {
      const res = await fetch(source.url, {
        headers: { "User-Agent": "Meiringen.org Bot/1.0" },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) continue;

      const html = await res.text();
      const events = await runParser(source.type, source.url, html);

      for (const event of events) {
        const slug = `${event.slug}-${Date.now().toString(36).slice(-4)}`;

        const { error: insertError } = await supabase.from("events").insert({
          ...event,
          slug,
        });

        if (insertError) {
          if (insertError.code === "23505") skipped++;
          else console.error("Insert error:", insertError.message);
        } else {
          imported++;
        }
      }

      await supabase
        .from("scraping_sources")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("id", source.id);
    } catch (err) {
      console.error(`Scrape failed for ${source.url}:`, err);
    }
  }

  return NextResponse.json({ imported, skipped, sources: sources?.length ?? 0 });
}
