import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only discover tests inside the library's own test directory.
    // This prevents Vitest from picking up example projects under examples/
    // which have their own test runners (Playwright) and dependencies that
    // are not installed at the repository root.
    include: ["tests/**/*.test.ts"],
  },
});
