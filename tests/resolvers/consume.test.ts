import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("consume", () => {
  const numbers = [1, 2, 3];

  createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
    test(mode, async () => {
      const consumed: number[] = [];
      await yielded
        .tap((value) => consumed.push(value satisfies number))
        .consume();
      expect(consumed).toStrictEqual(numbers);
    });
  });
});
