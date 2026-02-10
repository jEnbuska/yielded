import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";

describe("toSet", () => {
  const { modes } = createTestSets([3, 1, 2]);

  modes.forEach(({ mode, yielded }) => {
    test(`from ${mode}`, async () => {
      const set = (await yielded.toSet()) satisfies Set<number>;
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
      expect(set.size).toBe(3);
    });
  });
});
