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
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "artifacts/menu.png" });
  const snapshot = () =>
    page.evaluate(() => {
      const time = document
        .querySelector(".timer strong")
        ?.textContent?.split(":") || ["0", "0"];
      return {
        phase: document
          .querySelector("main")
          .className.split("phase-")[1]
          .toUpperCase(),
        elapsed: Number(time[0]) * 60 + Number(time[1]),
        speed:
          Number(document.querySelector(".speed-number")?.textContent || 0) *
          (document.querySelector(".gear span")?.textContent === "R" ? -1 : 1),
        nitro: Number(
          document
            .querySelector(".nitro>div>span:last-child")
            ?.textContent.replace("%", "")
            .trim() || 100,
        ),
        drifting: !!document.querySelector(".drift-label"),
        quality: JSON.parse(localStorage.getItem("toowix-settings-v1") || "{}")
          .state?.quality,
      };
    });
  await page.getByRole("button", { name: "LET’S DRIVE", exact: true }).click();
  await page.waitForTimeout(3500);
  assert.equal((await snapshot()).phase, "PLAYING");
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(1500);
  assert((await snapshot()).speed > 5);
  await page.keyboard.down("Space");
  await page.waitForTimeout(500);
  assert((await snapshot()).nitro < 100);
  await page.keyboard.up("Space");
  await page.keyboard.down("Shift");
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(200);
  assert((await snapshot()).drifting);
  await page.keyboard.up("Shift");
  await page.keyboard.up("ArrowRight");
  await page.keyboard.up("ArrowUp");
  await page.keyboard.press("Escape");
  const stopped = await snapshot();
  await page.waitForTimeout(500);
  assert.equal((await snapshot()).elapsed, stopped.elapsed);
  await page.getByRole("button", { name: "RESUME DRIVE" }).click();
  await page.keyboard.press("r");
  await page.waitForTimeout(3300);
  assert((await snapshot()).elapsed < 1);
  await page.keyboard.down("s");
  await page.waitForTimeout(900);
  await page.keyboard.up("s");
  assert((await snapshot()).speed < 0);
  await page.keyboard.press("r");
  await page.waitForTimeout(3300);
  await page.keyboard.down("w");
  await page.waitForTimeout(2200);
  await page.keyboard.up("w");
  await page.screenshot({ path: "artifacts/driving.png" });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "SETTINGS", exact: true }).click();
  await page.getByRole("button", { name: "NIGHT", exact: true }).click();
  await page.getByRole("button", { name: "LOW", exact: true }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "artifacts/night-settings.png" });
  await page.reload();
  await page.waitForTimeout(1500);
  assert((await page.locator("main").getAttribute("class")).includes("dark"));
  assert.equal((await snapshot()).quality, "low");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/mobile.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real keyboard acceleration, nitro, drift, pause freeze, resume, restart, reverse, theme/quality persistence, responsive layout; no browser errors.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
