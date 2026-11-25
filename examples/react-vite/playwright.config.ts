import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  // CI uploads the HTML report when a test fails
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: "http://localhost:4173",
    headless: true,
  },

  // Start the Vite preview server before running tests and shut it down after.
  webServer: {
    command: "pnpm exec vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 15_000,
  },

  // CI runs one project per job, in Playwright's container image (see
  // .github/workflows/ci.yml), named like the job's `browser` matrix value.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
