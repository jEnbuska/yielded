import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  // The oldest runtimes the library supports (Node 20.4, Safari 16.4) run
  // ES2022. Newer APIs, such as the Iterator helpers, are detected at runtime.
  target: "es2022",
  platform: "neutral",
  outDir: "dist",
  dts: true,
  sourcemap: true,
  minify: true,
  // Checks package.json's exports, types and files against what was built
  publint: true,
  // Checks that TypeScript resolves the types the way consumers import them.
  // The package is ESM only, so CommonJS `require` is not expected to work.
  attw: { profile: "esm-only" },
});
