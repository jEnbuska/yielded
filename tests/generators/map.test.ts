import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
import { Yielded } from "../../src";

describe("map", () => {
  const modulo4 = (n: number) => n % 4;

  test("map promises sync", async () => {
    const result = Yielded.from([1, 2, 3])
      .map((it) => Promise.resolve(it))
      .tap((n) => n satisfies Promise<number>)
      .toArray() satisfies Promise<number>[];
    expect(await Promise.all(result)).toStrictEqual([1, 2, 3]);
  });

  describe("numbers", () => {
    const expected = [2, 1, 3, 1, 0];
    createTestSets([2, 1, 3, 5, 4]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.map(modulo4).toArray()) satisfies number[],
        ).toStrictEqual(expected);
      });
    });
  });

  describe("from empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.map(modulo4).toArray()) satisfies number[],
        ).toStrictEqual([]);
      });
    });
  });
});
