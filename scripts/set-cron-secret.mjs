import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const secret = crypto.randomBytes(32).toString("hex");
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

for (const env of ["production", "preview"]) {
  const result = spawnSync(
    "vercel",
    ["env", "add", "CRON_SECRET", env, "--force", "--sensitive"],
    { cwd: root, input: secret, encoding: "utf8", shell: true }
  );
  if (result.status !== 0) {
    console.error(result.stdout, result.stderr);
    process.exit(1);
  }
}

fs.writeFileSync(path.join(root, ".setup-secret.tmp"), secret, "utf8");
console.log("CRON_SECRET set (length:", secret.length, ")");
