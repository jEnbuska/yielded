import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";

describe("sumBy", () => {
  const { empty, modes } = createTestSets([
    { value: 1 },
    { value: 2 },
    { value: 3 },
  ]);

  test("sumBy with empty", () => {
    expect(empty.sumBy((next) => next.value) satisfies number).toBe(0);
  });

  modes.forEach(({ mode, yielded }) => {
    test(`from ${mode}`, async () => {
      const result = (await yielded.sumBy(
        (next) => next.value,
      )) satisfies number;
      expect(result).toBe(6);
    });
  });
});
