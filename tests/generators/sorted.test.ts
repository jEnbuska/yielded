import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("sorted", () => {
  describe("sort numbers", () => {
    createTestSets([3, 1, 2]).orderedModes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.sorted((a, z) => a - z).toArray()) satisfies number[],
        ).toStrictEqual([1, 2, 3]);
      });
    });
  });

  describe("sort strings", () => {
    createTestSets(["d", "x", "a"]).orderedModes.forEach(
      ({ mode, yielded }) => {
        test(mode, async () => {
          expect(
            (await yielded.sorted().toArray()) satisfies string[],
          ).toStrictEqual(["a", "d", "x"]);
        });
      },
    );
  });

  describe("sort empty", () => {
    createTestSets<number>([]).orderedModes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.sorted((a, z) => a - z).toArray()) satisfies number[],
        ).toStrictEqual([]);
      });
    });
  });
});
