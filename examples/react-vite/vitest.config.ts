import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
