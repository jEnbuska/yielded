import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("take", () => {
  describe("take 1", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded.take(1).toArray()) satisfies number[];
        expect(result).toStrictEqual([1]);
      });
    });
  });

  describe("take 2", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded.take(2).toArray()) satisfies number[];
        expect(result).toStrictEqual([1, 2]);
      });
    });
  });

  describe("take none", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded.take(0).toArray()) satisfies number[];
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe("take negative", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        async function apply() {
          return yielded.take(-1).toArray();
        }
        await expect(apply()).rejects.toThrowError(RangeError);
      });
    });
  });
});
