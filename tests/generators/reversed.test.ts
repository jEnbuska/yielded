import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("reverse", () => {
  describe("numbers", () => {
    createTestSets([3, 1, 2]).orderedModes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const array = await yielded.reversed().toArray();
        expect(array).toStrictEqual([2, 1, 3]);
      });
    });
  });
});
