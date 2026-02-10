import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";
import { simpleMock } from "../utils/simpleMock.ts";
import "../utils/initTestPolyfills.ts";
describe("tap", () => {
  const numbers = [1, 2];

  describe("from array", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const callback = simpleMock(numbers);
        (await yielded.tap(callback).consume()) satisfies void;
        expect(callback.getCalled()).toBe(2);
      });
    });
  });

  test("from empty", () => {
    const callback = simpleMock(numbers);
    Yielded.from<number>([]).tap(callback).consume() satisfies void;
    expect(callback.getCalled()).toBe(0);
  });
});
