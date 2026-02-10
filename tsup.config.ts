import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false, // Disable tsup's dts generation, we'll use tsc separately
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  splitting: false,
  treeshake: true,
});
