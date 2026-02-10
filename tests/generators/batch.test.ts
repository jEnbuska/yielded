import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("batch", () => {
  describe("batch without left overs", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded
          .batch((acc) => acc.length < 3)
          .toArray()) satisfies number[][];

        expect(result).toStrictEqual([[1, 2, 3]]);
      });
    });
  });

  describe("batch without with 1 left over", () => {
    createTestSets([1, 2, 3, 4]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded
          .batch((acc) => acc.length < 3)
          .toArray()) satisfies number[][];

        expect(result).toStrictEqual([[1, 2, 3], [4]]);
      });
    });
  });

  describe("batch without with 2 left over", () => {
    createTestSets([1, 2, 3, 4, 5]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded
          .batch((acc) => acc.length < 3)
          .toArray()) satisfies number[][];

        expect(result).toStrictEqual([
          [1, 2, 3],
          [4, 5],
        ]);
      });
    });
  });
});
