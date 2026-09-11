const {
  chromium,
} = require("C:/Users/Xeon6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: [
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--enable-unsafe-swiftshader",
    ],
  });
  const page = await browser.newPage({
    viewport: { width: 1148, height: 960 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(2200);
  await page.getByRole("button", { name: "LET’S DRIVE", exact: true }).click();
  await page.waitForTimeout(3300);
  await page.evaluate(async () => {
    const resources = performance.getEntriesByType("resource");
    const s = await import(
      resources.find((e) => e.name.includes("/src/store.ts")).name
    );
    const { trackAt } = await import(
      resources.find((e) => e.name.includes("/src/game/track.ts")).name
    );
    const p = trackAt(0.08, 9.65);
    Object.assign(s.runtime, p, { yaw: p.yaw + 0.3, vx: 0, vz: 0 });
    s.useSettings.getState().set({ theme: "dark", color: "#eee9d9" });
  });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "artifacts/rail-contact-fixed.png" });
  const gap = await page.evaluate(async () => {
    const resources = performance.getEntriesByType("resource");
    const s = await import(
      resources.find((e) => e.name.includes("/src/store.ts")).name
    );
    const { nearest } = await import(
      resources.find((e) => e.name.includes("/src/game/track.ts")).name
    );
    const { footprint } = await import(
      resources.find((e) => e.name.includes("/src/game/collision.ts")).name
    );
    return Math.max(
      ...footprint(s.runtime).map((p) => nearest(p.x, p.z).distance),
    );
  });
  assert(gap <= 9.402);
  await page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/src/store.ts")).name;
    const s = await import(url);
    s.useSettings.getState().set({ theme: "light", color: "#e84836" });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const view of ["front", "rear", "side"]) {
    await page.goto(
      "http://localhost:5173/tests/car-showcase.html?view=" + view,
    );
    await page.waitForTimeout(2200);
    await page.screenshot({ path: "artifacts/car-" + view + ".png" });
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: no rail intersection at reported viewport; front/rear/side model renders without browser errors.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
