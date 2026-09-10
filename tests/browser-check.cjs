const {
  chromium,
} = require("C:/Users/Xeon6/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const fs = require("node:fs");
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
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(6000);
  fs.mkdirSync("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/menu.png" });
  await page.getByRole("button", { name: "LET’S DRIVE", exact: true }).click();
  await page.waitForTimeout(3800);
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await page.keyboard.up("w");
  await page.screenshot({ path: "artifacts/driving.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  console.log(
    "PAUSE_VISIBLE",
    await page.getByText("PIT STOP.", { exact: true }).isVisible(),
  );
  await page.getByRole("button", { name: "SETTINGS", exact: true }).click();
  await page.getByRole("button", { name: "NIGHT", exact: true }).click();
  await page.screenshot({ path: "artifacts/night-settings.png" });
  await page.reload();
  await page.waitForTimeout(2500);
  console.log(
    "THEME_PERSISTED",
    await page.locator("main").getAttribute("class"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/mobile.png" });
  console.log("ERRORS", JSON.stringify(errors));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
