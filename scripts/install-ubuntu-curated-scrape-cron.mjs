#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const start = "# BEGIN meiringen curated scrape";
const end = "# END meiringen curated scrape";
const cronLine =
  "17 5 * * * cd /home/ubuntu/Meiringen && /usr/bin/flock -n /tmp/meiringen-curated-scrape.lock npx tsx scripts/run-curated-scrape.mjs >> /tmp/meiringen-curated-scrape.log 2>&1";

const current = spawnSync("crontab", ["-l"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const existing = current.status === 0 ? current.stdout.trimEnd() : "";
const block = `${start}\n${cronLine}\n${end}`;
const next = existing.includes(start)
  ? existing.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block)
  : [existing, block].filter(Boolean).join("\n\n");

const install = spawnSync("crontab", ["-"], {
  input: `${next}\n`,
  encoding: "utf8",
  stdio: ["pipe", "pipe", "pipe"],
  cwd: root,
});

if (install.status !== 0) {
  console.error(install.stderr || "Failed to install crontab");
  process.exit(1);
}

console.log("Installed daily Meiringen curated scrape cron at 05:17 UTC.");
console.log("Logs: /tmp/meiringen-curated-scrape.log");
