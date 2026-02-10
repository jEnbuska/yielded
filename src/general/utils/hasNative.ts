import { Yielded } from "../../sync/Yielded.ts";

export function hasNative<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  key: K,
): boolean {
  if (Yielded.__USE_POLYFILL_ONLY__) return false;
  return key in obj;
}
