import { Yielded } from "../../src/index.ts";

// `pnpm test` runs the suite twice: once with the native Iterator helpers
// where the runtime has them, and once with USE_POLYFILLS=true, which forces
// the library's own implementations of every operator.
if (process.env.USE_POLYFILLS === "true") {
  Yielded.__USE_POLYFILL_ONLY__ = true;
}
