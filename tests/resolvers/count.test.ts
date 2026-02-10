import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";

describe("count", () => {
  const numbers = [1, 2, 3];
  const { empty, modes } = createTestSets(numbers);
  modes.forEach(({ mode, yielded }) => {
    test(mode, async () => {
      expect((await yielded.count()) satisfies number).toBe(numbers.length);
    });
  });

  test("from empty", () => {
    expect(empty.count() satisfies number).toBe(0);
  });
});
