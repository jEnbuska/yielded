import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: "list",

  use: {
    baseURL: "http://localhost:4173",
    headless: true,
  },

  // Start the Vite preview server before running tests and shut it down after.
  webServer: {
    command: "npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 15_000,
  },

  projects: [
    {
      name: "Chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "WebKit (Safari)",
      use: { ...devices["Desktop Safari"] },
    },
    {
      // Requires Microsoft Edge to be installed on the system.
      // Tests for this project are skipped automatically if Edge is not found.
      name: "Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],
});
