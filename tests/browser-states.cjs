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
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "LET’S DRIVE", exact: true }).click();
  await page.waitForTimeout(3300);
  await page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/src/store.ts")).name;
    const s = await import(url);
    if (s.useGame.getState().phase !== "PLAYING")
      throw Error("Incorrect module instance");
    window.testStore = s;
    s.runtime.elapsed = 359.99;
  });
  await page.getByText("ONE MORE RUN?", { exact: true }).waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "artifacts/game-over.png" });
  await page.getByRole("button", { name: "DRIVE AGAIN", exact: true }).click();
  await page.waitForTimeout(3300);
  // Seed gate positions to exercise UI integration. Continuous driving is independently tested in vehicle.test.ts.
  for (let n = 1; n <= 16; n++) {
    await page.evaluate(async (n) => {
      const url = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/src/game/track.ts")).name;
      const { trackAt } = await import(url);
      const p = trackAt((n % 8) / 8);
      Object.assign(window.testStore.runtime, {
        x: p.x,
        z: p.z,
        yaw: p.yaw,
        vx: Math.sin(p.yaw) * 10,
        vz: Math.cos(p.yaw) * 10,
      });
    }, n);
    await page.waitForTimeout(160);
  }
  await page.getByText("NICE DRIVE.", { exact: true }).waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "artifacts/finished.png" });
  assert(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("toowix-settings-v1")).state.best > 0,
    ),
  );
  await page.getByRole("button", { name: "MAIN MENU", exact: true }).click();
  await page.getByRole("button", { name: "HOW TO PLAY", exact: true }).click();
  assert(await page.getByText("FIND YOUR LINE.", { exact: true }).isVisible());
  assert.deepEqual(errors, []);
  console.log(
    "PASS: time-limit GAME_OVER, restart, ordered gate FINISHED integration, results, saved best time and help screen.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
