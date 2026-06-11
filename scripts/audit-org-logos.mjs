import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../supabase/migrations");
const checkUrls = process.argv.includes("--check");

const migrationFiles = [
  "0004_meiringen_organizations.sql",
  "0005_organization_localities.sql",
];

const GENERIC_DOMAINS = [
  "haslital-brienz.ch",
  "vereinsverzeichnis.ch",
  "localcities.ch",
];

function parseOrgsFromSql(fileName) {
  const sql = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
  const insertStart = sql.indexOf("insert into public.organizations");
  if (insertStart === -1) return [];

  let insertEnd = sql.indexOf("-- Sample events", insertStart);
  if (insertEnd === -1) insertEnd = sql.indexOf("on conflict", insertStart);
  if (insertEnd === -1) insertEnd = sql.length;

  const insertBlock = sql.slice(insertStart, insertEnd);
  return insertBlock
    .split(/\),\s*\n\(/)
    .map((block, i) =>
      i === 0 ? block.replace(/^[\s\S]*?\(\s*\n/, "") : block
    )
    .filter((block) => block.includes("array["))
    .map((block) => {
      const quoted = [...block.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map(
        (m) => m[1].replace(/''/g, "'")
      );
      const [name, slug] = quoted;
      const websiteUrl =
        quoted.find(
          (value) =>
            value.startsWith("https://") &&
            !value.includes("google.com/s2/favicons") &&
            !value.includes("vereinsverzeichnis.ch") &&
            !value.includes("localcities.ch") &&
            !value.includes("/vereine") &&
            !value.includes("/vereinsliste")
        ) ?? null;
      const imageUrl =
        quoted.find((value) => value.includes("google.com/s2/favicons")) ?? null;

      return { name, slug, websiteUrl, imageUrl };
    });
}

function isGenericFavicon(imageUrl) {
  if (!imageUrl) return true;
  return GENERIC_DOMAINS.some((domain) => imageUrl.includes(`domain=${domain}`));
}

function resolvedLogo(org) {
  if (org.imageUrl && !isGenericFavicon(org.imageUrl)) return org.imageUrl;
  if (org.websiteUrl) {
    try {
      const hostname = new URL(org.websiteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  }
  return null;
}

const orgs = migrationFiles.flatMap(parseOrgsFromSql);
const bySlug = new Map();
for (const org of orgs) {
  if (!bySlug.has(org.slug)) bySlug.set(org.slug, org);
}
const uniqueOrgs = [...bySlug.values()];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    return { ok: false, status: error.message };
  }
}

console.log(`Total organizations: ${uniqueOrgs.length}\n`);

const genericLogo = uniqueOrgs.filter((o) => isGenericFavicon(o.imageUrl));
const missingResolved = uniqueOrgs.filter((o) => !resolvedLogo(o));
const noWebsite = uniqueOrgs.filter((o) => !o.websiteUrl);

console.log(`Generic portal favicon in seed: ${genericLogo.length}`);
console.log(`No dedicated website: ${noWebsite.length}`);
console.log(`Still missing logo after resolution rules: ${missingResolved.length}\n`);

console.log("--- Generic seed favicons ---");
for (const org of genericLogo) {
  console.log(`- ${org.slug}`);
}

console.log("\n--- Missing logo after website/locality fallback ---");
for (const org of missingResolved) {
  console.log(`- ${org.slug} (${org.websiteUrl ?? "no website"})`);
}

if (checkUrls) {
  console.log("\n--- Checking stored image URL availability ---");
  for (const org of uniqueOrgs) {
    if (!org.imageUrl) continue;
    const result = await checkUrl(org.imageUrl);
    if (!result.ok) {
      console.log(`BROKEN ${org.slug}: ${result.status}`);
    }
  }
}
