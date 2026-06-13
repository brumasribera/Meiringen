/** Fetch website from known meiringen.ch vereinsliste detail pages. */
const IDS = [
  23456, 23511, 24032, 24398, 24600, 23512, 23513, 23514, 23515, 23516,
  23517, 23518, 23519, 23520, 23688, 23700, 23750, 23800, 23900, 24000,
  24100, 24200, 24300, 24400, 24500, 24700,
];

async function fetchOne(id) {
  const res = await fetch(`https://www.meiringen.ch/vereinsliste/${id}`, {
    headers: { "User-Agent": "Meiringen.life/1.0" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim();
  const website = html.match(
    /href="(https?:\/\/[^"]+)"[^>]*class="[^"]*icms-link-ext[^"]*"[^>]*>\s*Website/i
  )?.[1];
  if (!title) return null;
  return { id, title, website: website && !website.includes("meiringen.ch") ? website : null };
}

async function main() {
  for (const id of IDS) {
    try {
      const row = await fetchOne(id);
      if (row) console.log(JSON.stringify(row));
    } catch (e) {
      console.error(id, e.message);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

main();
