import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "meiringen-vereine-scan.json");

async function scanId(id) {
  const url = `https://www.meiringen.ch/vereinsliste/${id}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Meiringen.life/1.0" },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const html = await res.text();
  if (!html.includes("icms-link-ext")) return null;
  const title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim();
  const website = html.match(
    /href="(https?:\/\/[^"]+)"[^>]*class="[^"]*icms-link-ext[^"]*"[^>]*>\s*Website/i
  )?.[1];
  if (!title || !website || website.includes("meiringen.ch")) return null;
  return { id, title, website };
}

async function main() {
  const results = [];
  const start = Number(process.argv[2] ?? 23000);
  const end = Number(process.argv[3] ?? 25000);

  for (let id = start; id <= end; id++) {
    const row = await scanId(id);
    if (row) {
      results.push(row);
      console.log(`${row.id}: ${row.title} -> ${row.website}`);
    }
    if (id % 50 === 0) console.error(`... scanned ${id}`);
    await new Promise((r) => setTimeout(r, 80));
  }

  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} entries to ${out}`);
}

main().catch(console.error);
