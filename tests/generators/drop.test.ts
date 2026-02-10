import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("drop", () => {
  describe("drop none", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.drop(0).toArray()).toStrictEqual([1, 2, 3]);
      });
    });
  });

  describe("drop 1", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.drop(1).toArray()).toStrictEqual([2, 3]);
      });
    });
  });
  describe("drop all", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.drop(3).toArray()).toStrictEqual([]);
      });
    });
  });
  describe("drop more", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.drop(5).toArray()).toStrictEqual([]);
      });
    });
  });

  describe("drop negative", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        async function apply() {
          return yielded.drop(-1).toArray();
        }
        await expect(apply()).rejects.toThrowError(RangeError);
      });
    });
  });
});
