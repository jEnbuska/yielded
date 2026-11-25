import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only the library's own tests. The examples have their own runners.
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/utils/initTestPolyfills.ts"],
    coverage: {
      include: ["src/**/*.ts"],
    },
  },
});
