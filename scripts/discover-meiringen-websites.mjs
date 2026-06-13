/**
 * Discover meiringen.ch vereinsliste IDs and extract website URLs.
 */
const BASE = "https://www.meiringen.ch";

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Meiringen.life/1.0" },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function extractWebsite(html) {
  const m = html.match(
    /href="(https?:\/\/[^"]+)"[^>]*class="[^"]*icms-link-ext[^"]*"[^>]*>\s*Website/i
  );
  if (m && !m[1].includes("meiringen.ch")) return m[1];
  return null;
}

function extractTitle(html) {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return m?.[1]?.trim() ?? null;
}

async function searchVerein(query) {
  const url = `${BASE}/vereinsliste?search=${encodeURIComponent(query)}`;
  const html = await fetchText(url);
  const ids = [...html.matchAll(/vereinsliste\/(\d+)/g)].map((x) => x[1]);
  return [...new Set(ids)];
}

async function main() {
  const queries = [
    "Nordischer Skiclub",
    "Kanu Klub",
    "Tauchclub",
    "Curling",
    "SV Meiringen",
    "Fotoclub",
    "Schwingerfreunde",
    "Männerchor",
    "Frauenchor",
    "Theatergruppe Glinggige",
    "Museumsverein",
    "ART CULTURE",
    "FV Oberhasli",
    "Gemeinnütziger",
    "Karate",
    "Kynologischer",
    "AMC",
    "Fluggruppe",
    "Schützen Balm",
    "Schützen Hausen",
    "Mütter",
    "Tagesfamilien",
    "Jodlerklub Innertkirchen",
    "Frauenchor Innertkirchen",
    "Webgruppe",
    "Trachtengruppe Brienz",
    "Handharmonika",
    "Schachclub",
    "Eisbahnverein",
    "Musikförderverein",
    "Damenturnverein Brienzwiler",
    "Freischützen",
    "Theaterliit",
    "Trychelzug",
    "Puurerladen",
    "Hasliberg",
    "Oberried",
    "Skiclub Hofstetten",
    "Verkehrsverein",
    "Schwanden",
    "Guttannen",
    "Schattenhalb",
  ];

  const seen = new Set();
  const results = [];

  for (const q of queries) {
    const ids = await searchVerein(q);
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const html = await fetchText(`${BASE}/vereinsliste/${id}`);
      const name = extractTitle(html);
      const website = extractWebsite(html);
      if (website) {
        results.push({ id, name, website, query: q });
        console.log(`${name}: ${website}`);
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log("\n--- JSON ---");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
