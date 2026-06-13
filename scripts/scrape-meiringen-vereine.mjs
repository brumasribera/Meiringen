/**
 * Scrape meiringen.ch vereinsliste detail pages for website URLs.
 */
const BASE = "https://www.meiringen.ch";

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Meiringen.life/1.0 (org website enrichment)" },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function extractWebsite(html) {
  const patterns = [
    /Homepage[\s\S]{0,80}?href="(https?:\/\/[^"]+)"/i,
    /Website[\s\S]{0,120}?href="(https?:\/\/[^"]+)"/i,
    /href="(https?:\/\/(?!www\.meiringen\.ch)[^"]+)"[^>]*>\s*Website/i,
    />(?:Homepage|Webseite|Website)<\/a>\s*<\/[^>]+>\s*<a[^>]+href="(https?:\/\/[^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] && !m[1].includes("meiringen.ch")) return m[1];
  }

  const links = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter(
      (u) =>
        !u.includes("meiringen.ch") &&
        !u.includes("facebook.com/plugins") &&
        !u.includes("google") &&
        !u.includes("youtube.com/embed") &&
        !u.includes("cookie") &&
        !u.endsWith(".css") &&
        !u.endsWith(".js")
    );
  return links[0] ?? null;
}

async function listAllVereine() {
  const html = await fetchText(`${BASE}/vereinsliste`);
  const ids = [...html.matchAll(/vereinsliste\/(\d+)/g)].map((m) => m[1]);
  return [...new Set(ids)];
}

async function main() {
  const ids = await listAllVereine();
  console.log(`Found ${ids.length} vereine entries`);

  const results = [];
  for (const id of ids) {
    try {
      const html = await fetchText(`${BASE}/vereinsliste/${id}`);
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const name = titleMatch?.[1]?.trim() ?? id;
      const website = extractWebsite(html);
      if (website) {
        results.push({ id, name, website });
        console.log(`${name}: ${website}`);
      }
    } catch (err) {
      console.error(id, err.message);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log("\n--- JSON ---");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
