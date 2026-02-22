import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { existsSync } from "fs";

const APP_URL = "http://localhost:4173";

/** Resolve the path to a system browser executable, or skip if not found. */
function findBrowser(candidates: string[]): string | null {
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

const BROWSER_CONFIGS = [
  {
    name: "Chrome",
    executablePath: findBrowser([
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]),
    product: "chrome" as const,
  },
  {
    name: "Firefox",
    executablePath: findBrowser(["/usr/bin/firefox", "/usr/local/bin/firefox"]),
    product: "firefox" as const,
  },
].filter((b) => b.executablePath !== null) as Array<{
  name: string;
  executablePath: string;
  product: "chrome" | "firefox";
}>;

for (const { name, executablePath, product } of BROWSER_CONFIGS) {
  describe(`Browser: ${name}`, () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
      browser = await puppeteer.launch({
        executablePath,
        browser: product,
        headless: true,
        args:
          product === "chrome"
            ? ["--no-sandbox", "--disable-setuid-sandbox"]
            : [],
      });
    });

    afterAll(async () => {
      await browser?.close();
    });

    it("loads the app and shows an initial count of 0", async () => {
      page = await browser.newPage();
      await page.goto(APP_URL, { waitUntil: "domcontentloaded" });

      const count = await page.$eval(
        "#count-display",
        (el) => el.textContent,
      );
      expect(count).toBe("0");

      await page.close();
    });

    it("increments the count to 1 after one click", async () => {
      page = await browser.newPage();
      await page.goto(APP_URL, { waitUntil: "domcontentloaded" });

      await page.click("#increment-btn");
      await page.waitForFunction(
        () => document.querySelector("#count-display")?.textContent !== "0",
      );

      const count = await page.$eval(
        "#count-display",
        (el) => el.textContent,
      );
      expect(count).toBe("1");

      await page.close();
    });

    it("increments the count to 3 after three clicks", async () => {
      page = await browser.newPage();
      await page.goto(APP_URL, { waitUntil: "domcontentloaded" });

      await page.click("#increment-btn");
      await page.click("#increment-btn");
      await page.click("#increment-btn");
      await page.waitForFunction(
        () => document.querySelector("#count-display")?.textContent === "3",
      );

      const count = await page.$eval(
        "#count-display",
        (el) => el.textContent,
      );
      expect(count).toBe("3");

      // The items list should show doubled numbers 1–3: [2, 4, 6]
      const items = await page.$$eval("#items-list li", (els) =>
        els.map((el) => el.textContent),
      );
      expect(items).toEqual(["2", "4", "6"]);

      await page.close();
    });
  });
}
