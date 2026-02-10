import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";

describe("mapPairwise", () => {
  const expected = [3, 0, 0, 1];
  const modulo4 = (a: number, b: number) => (a + b) % 4;

  describe("map numbers", () => {
    createTestSets<number>([2, 1, 3, 5, 4]).modes.forEach(
      ({ mode, yielded }) => {
        test(mode, async () => {
          expect(
            (await yielded.mapPairwise(modulo4).toArray()) satisfies number[],
          ).toStrictEqual(expected);
        });
      },
    );
  });

  describe("from empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.mapPairwise(modulo4).toArray()) satisfies number[],
        ).toStrictEqual([]);
      });
    });
  });
});
