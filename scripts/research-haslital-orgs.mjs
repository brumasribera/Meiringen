import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "supabase", "research");
const outJson = path.join(outDir, "haslital-org-research.json");

const candidates = [
  {
    name: "Samariterverein Meiringen",
    slug: "samariterverein-meiringen",
    locality: "meiringen",
    category: "social",
    source_url: "https://www.meiringen.ch/vereinsliste/23663",
    website_url: "https://www.samariter-meiringen.ch",
  },
  {
    name: "Reitverein Oberhasli Brienz",
    slug: "reitverein-oberhasli-brienz",
    locality: "meiringen",
    category: "sport",
    source_url: "https://www.meiringen.ch/vereinsliste/23537",
    website_url: "https://www.reitverein-oberhasli-brienz.ch",
  },
  {
    name: "Kindergartenverein Meiringen",
    slug: "kindergartenverein-meiringen",
    locality: "meiringen",
    category: "education",
    source_url: "https://www.meiringen.ch/vereinsliste/29353",
  },
  {
    name: "Berner KMU Oberhasli",
    slug: "berner-kmu-oberhasli",
    locality: "meiringen",
    category: "other",
    source_url: "https://www.meiringen.ch/vereinsliste/31127",
    website_url: "https://www.kmu-oberhasli.ch",
  },
  {
    name: "DVO Detaillistenverein Oberhasli",
    slug: "dvo-detaillistenverein-oberhasli",
    locality: "meiringen",
    category: "other",
    source_url: "https://www.meiringen.ch/vereinsliste/38719",
  },
  {
    name: "Fischereiverein Oberhasli",
    slug: "fischereiverein-oberhasli",
    locality: "meiringen",
    category: "nature",
    source_url: "https://www.meiringen.ch/vereinsliste/86678",
    website_url: "https://www.fv-oberhasli.ch",
  },
  {
    name: "Dynamo Wiggäfisch",
    slug: "dynamo-wiggaefisch",
    locality: "schattenhalb",
    category: "social",
    source_url: "https://www.meiringen.ch/vereinsliste/99346",
  },
  {
    name: "Ringclub Oberhasli",
    slug: "ringclub-oberhasli",
    locality: "innertkirchen",
    category: "sport",
    source_url: "https://www.haslital-brienz.ch/vereine",
  },
  {
    name: "SLRG Sektion Thun-Oberland / Aussenstation Brienz-Meiringen",
    slug: "slrg-sektion-thun-oberland-aussenstation-brienz-meiringen",
    locality: "brienz",
    category: "sport",
    source_url: "https://www.meiringen.ch/vereinsliste/28562",
    website_url: "https://slrg-thunoberland.ch/brienz-meiringen",
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function domain(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return env;
}

export async function runHaslitalResearch() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const env = { ...process.env, ...loadEnvFile(path.join(root, ".env.local")) };
  const dbUrl = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || env.DATABASE_URL;
  const client = dbUrl
    ? new pg.Client({
        connectionString: dbUrl,
        ssl: {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
        },
      })
    : null;

  const existing = [];
  if (client) {
    await client.connect();
    const { rows } = await client.query(
      "select slug, name, website_url, source_url from public.organizations"
    );
    existing.push(...rows);
    await client.end();
  }

  const existingSlugs = new Set(existing.map((row) => row.slug));
  const existingDomains = new Set(
    existing.map((row) => row.website_url).filter(Boolean).map(domain).filter(Boolean)
  );

  const report = candidates.map((candidate) => {
    const slug = candidate.slug || slugify(candidate.name);
    const websiteDomain = candidate.website_url ? domain(candidate.website_url) : null;
    return {
      ...candidate,
      slug,
      exists_as_slug: existingSlugs.has(slug),
      duplicate_website_domain: websiteDomain ? existingDomains.has(websiteDomain) : false,
      confidence: candidate.website_url ? "confirmed" : "directory-only",
      needs_review: false,
    };
  });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2));
  console.log(`Wrote ${outJson}`);
  return outJson;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runHaslitalResearch().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
