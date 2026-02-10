import { Yielded } from "../../src";

if (process && process.env.USE_POLYFILLS === "true") {
  // Set the flag to force the use of polyfill implementations for all operators
  // This can be useful for testing the correctness and performance of the polyfill versions in environments that support native implementations.
  Yielded.__USE_POLYFILL_ONLY__ = true;
}
