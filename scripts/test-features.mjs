const BASE = process.env.TEST_BASE ?? "https://www.meiringen.life";
const EXPECTED_SITE = "https://www.meiringen.life";

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, ok: false, message });
    console.log(`✗ ${name}: ${message}`);
  }
}

async function get(path) {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  return response;
}

async function main() {
  console.log(`Testing ${BASE}\n`);

  await check("Apex redirects to www", async () => {
    const response = await fetch("https://meiringen.life/", { redirect: "manual" });
    if (![301, 307, 308].includes(response.status)) {
      throw new Error(`HTTP ${response.status}`);
    }
    const location = response.headers.get("location") ?? "";
    if (!location.includes("www.meiringen.life")) {
      throw new Error(`Unexpected redirect: ${location}`);
    }
  });

  await check("Login page", () => get("/de/login"));

  await check("Auth callback route", async () => {
    const response = await fetch(`${BASE}/auth/callback`, { redirect: "manual" });
    if (![302, 307].includes(response.status)) {
      throw new Error(`HTTP ${response.status}`);
    }
  });

  await check("Home DE", () => get("/de"));
  await check("Events page", () => get("/de/events"));
  await check("Events filtered", () => get("/de/events?category=sport"));
  await check("Alerts page", () => get("/de/alerts"));
  await check("Organizations", () => get("/de/organizations"));
  await check("About", () => get("/de/about"));
  await check("Logo SVG", () => get("/brand/logo-mark.svg"));
  await check("Logo PNG", () => get("/brand/logo-mark.png"));

  await check("Maps provider API", async () => {
    const response = await fetch(`${BASE}/api/maps/provider`);
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
  });

  let token = "";
  await check("Alert subscribe API", async () => {
    const response = await fetch(`${BASE}/api/alerts/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        frequency: "weekly",
        categories: ["culture"],
        languages: ["de"],
        locale: "de",
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    if (!data.ok) throw new Error("ok false");
    if (!data.manageUrl) throw new Error("missing manageUrl");
    if (!data.manageUrlFull?.startsWith(EXPECTED_SITE)) {
      throw new Error(`manageUrlFull uses wrong site: ${data.manageUrlFull}`);
    }
    token = data.manageUrl.split("token=")[1] ?? "";
    console.log(`  emailSent=${data.emailSent} emailError=${data.emailError ?? "none"}`);
    if (!data.emailSent) {
      console.log("  (Install Resend on Vercel to enable welcome emails)");
    }
  });

  if (token) {
    await check("Alert manage GET", async () => {
      const response = await fetch(
        `${BASE}/api/alerts/manage?token=${encodeURIComponent(token)}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      if (!data.email) throw new Error("missing email");
    });

    await check("Alert manage PATCH", async () => {
      const response = await fetch(
        `${BASE}/api/alerts/manage?token=${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frequency: "monthly",
            categories: ["sport"],
            languages: ["de"],
            locale: "de",
            active: true,
          }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
    });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
