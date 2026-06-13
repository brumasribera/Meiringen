import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
  if (match) env[match[1]] = match[2];
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const settings = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } }).then((r) =>
  r.json()
);
console.log("external providers:", settings.external);

const authorize = await fetch(
  `${url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent("https://www.meiringen.life/auth/callback")}`,
  { headers: { apikey: key }, redirect: "manual" }
);
console.log("authorize status:", authorize.status);
if (!authorize.ok) console.log("authorize error:", await authorize.json());
