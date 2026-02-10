import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import { simpleMock } from "../utils/simpleMock.ts";

describe("takeWhile", () => {
  const numbers = [-2, -1, 0, 1, 2];
  describe("takeWhile negative", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const callback = simpleMock(numbers);
        const result = await yielded
          .tap(callback)
          .takeWhile((n) => n < 0)
          .toArray();
        expect(result).toStrictEqual([-2, -1]);
        if (mode === "parallel")
          expect(callback.getCalled()).toBeLessThanOrEqual(4);
        else expect(callback.getCalled()).toBe(3);
      });
    });
  });

  describe("takeWhile always", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const callback = simpleMock(numbers);
        const result = (await yielded
          .tap(callback)
          .takeWhile(() => true)
          .toArray()) satisfies number[];
        expect(result).toStrictEqual(numbers);
        expect(callback.getCalled()).toBe(numbers.length);
      });
    });
  });

  describe("takeWhile never", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const callback = simpleMock(numbers);
        const result = (await yielded
          .tap(callback)
          .takeWhile(() => false)
          .toArray()) satisfies number[];
        expect(result).toStrictEqual([]);
        if (mode === "parallel")
          expect(callback.getCalled()).toBeLessThanOrEqual(2);
        else expect(callback.getCalled()).toBe(1);
      });
    });
  });
});
