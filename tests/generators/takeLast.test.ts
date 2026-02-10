import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("takeLast", () => {
  describe("take last when empty", () => {
    createTestSets([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.takeLast(3).toArray()).toStrictEqual([]);
      });
    });
  });

  describe("take last when count is 0", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.takeLast(0).toArray()).toStrictEqual([]);
      });
    });
  });

  describe("take last when count is more than number of inputs", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.takeLast(5).toArray()).toStrictEqual([1, 2, 3]);
      });
    });
  });
  describe("take last when count negative ", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(() => yielded.takeLast(-1)).toThrowError(RangeError);
      });
    });
  });

  describe("take last when count less than array length ", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.takeLast(2).toArray()).toStrictEqual([2, 3]);
      });
    });
  });

  describe("take last when empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded.takeLast(3).toArray()) satisfies number[];
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe("take last when count is 0", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded.takeLast(0).toArray()) satisfies number[];
        expect(result).toStrictEqual([]);
      });
    });
  });
});
