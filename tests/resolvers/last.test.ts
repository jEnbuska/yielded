import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("last", () => {
  createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
    test(mode, async () => {
      expect(await yielded.last()).toBe(3);
    });
  });
});
