#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const noAi = args.has("--no-ai") || process.env.MEIRINGEN_AI_RESEARCH === "0";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[line.slice(0, idx).trim()] ??= value;
  }
}

function parseJsonMessage(text) {
  const trimmed = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(trimmed);
}

function codexExists() {
  const result = spawnSync("codex", ["--version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return result.status === 0;
}

function runCodexResearchPrompt() {
  if (!codexExists()) {
    return { skipped: true, reason: "codex command is not installed" };
  }

  const promptPath = path.join(
    root,
    "scripts/prompts/meiringen-curated-scrape.md",
  );
  const schemaPath = path.join(
    root,
    "scripts/curated-scrape-result.schema.json",
  );
  const outputPath = path.join(
    os.tmpdir(),
    `meiringen-curated-scrape-${Date.now()}.json`,
  );
  const today = new Date().toISOString().slice(0, 10);
  const prompt = fs
    .readFileSync(promptPath, "utf8")
    .replaceAll("{{TODAY}}", today);

  const result = spawnSync(
    "codex",
    [
      "exec",
      "--search",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--ask-for-approval",
      "never",
      "--output-schema",
      schemaPath,
      "--output-last-message",
      outputPath,
      "-C",
      root,
      "-",
    ],
    {
      input: prompt,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 8,
      timeout: Number(process.env.MEIRINGEN_CODEX_TIMEOUT_MS ?? 1000 * 60 * 12),
    },
  );

  if (result.status !== 0) {
    return {
      skipped: true,
      reason: result.stderr || result.stdout || "codex research failed",
    };
  }

  const message = fs.readFileSync(outputPath, "utf8");
  fs.rmSync(outputPath, { force: true });
  return {
    skipped: false,
    result: parseJsonMessage(message),
  };
}

loadDotEnv(envPath);

const missingEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
].filter((key) => !process.env[key]);

if (missingEnv.length > 0 && !dryRun) {
  console.error(
    JSON.stringify(
      {
        error: "Missing Supabase env vars",
        missingEnv,
        hint: "Pull Vercel env vars into .env.local or run with exported production env vars.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const summary = {
  directories: null,
  agenda: null,
  ai: null,
  dryRun,
  syncedAt: new Date().toISOString(),
};

if (!dryRun) {
  const { syncOrganizationDirectories } = await import(
    pathToFileURL(path.join(root, "src/lib/organizations/sync-directories.ts"))
      .href
  );
  const { syncAgenda } = await import(
    pathToFileURL(path.join(root, "src/lib/agenda/scrape-events.ts")).href
  );

  summary.directories = await syncOrganizationDirectories();
  summary.agenda = await syncAgenda();
}

if (!noAi) {
  const research = runCodexResearchPrompt();
  if (research.skipped) {
    summary.ai = { skipped: true, reason: research.reason };
  } else if (dryRun) {
    summary.ai = {
      skipped: false,
      candidates: {
        organizations: research.result.organizations?.length ?? 0,
        events: research.result.events?.length ?? 0,
      },
    };
  } else {
    const { createServiceClient } = await import(
      pathToFileURL(path.join(root, "src/lib/supabase/server.ts")).href
    );
    const { importCuratedScrapeResult } = await import(
      pathToFileURL(path.join(root, "src/lib/curation/curated-import.ts")).href
    );
    const supabase = await createServiceClient();
    summary.ai = await importCuratedScrapeResult(supabase, research.result);
  }
}

console.log(JSON.stringify(summary, null, 2));
