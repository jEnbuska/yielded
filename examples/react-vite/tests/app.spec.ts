import { test, expect } from "@playwright/test";

test("loads the app and shows an initial count of 0", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#count-display")).toHaveText("0");
});

test("increments the count to 1 after one click", async ({ page }) => {
  await page.goto("/");
  await page.click("#increment-btn");
  await expect(page.locator("#count-display")).toHaveText("1");
});

test("increments the count to 3 after three clicks", async ({ page }) => {
  await page.goto("/");
  await page.click("#increment-btn");
  await page.click("#increment-btn");
  await page.click("#increment-btn");

  await expect(page.locator("#count-display")).toHaveText("3");

  // Items list shows doubled numbers 1–3: [2, 4, 6]
  const items = page.locator("#items-list li");
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toHaveText("2");
  await expect(items.nth(1)).toHaveText("4");
  await expect(items.nth(2)).toHaveText("6");
});
