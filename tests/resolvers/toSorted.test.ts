import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";
import { sleep } from "../utils/sleep.ts";
import "../utils/initTestPolyfills.ts";

describe("toSorted", () => {
  describe("toSorted numbers", () => {
    createTestSets([3, 1, 2]).modes.forEach(({ yielded, mode }) => {
      test(mode, async () => {
        const arr = (await yielded.toSorted(
          (a, z) => a - z,
        )) satisfies number[];
        expect(arr).toStrictEqual([1, 2, 3]);
      });
    });
  });

  describe("toSorted without comparator", () => {
    createTestSets(["a", "x", "b"]).modes.forEach(({ yielded, mode }) => {
      test(mode, async () => {
        const arr = (await yielded.toSorted()) satisfies string[];
        expect(arr).toStrictEqual(["a", "b", "x"]);
      });
    });
  });

  describe("toSorted empty", () => {
    createTestSets<number>([]).modes.forEach(({ yielded, mode }) => {
      test(mode, async () => {
        const arr = (await yielded.toSorted(
          (a, z) => a - z,
        )) satisfies number[];
        expect(arr).toStrictEqual([]);
      });
    });
  });

  test("toSorted parallel 3", async () => {
    expect(
      await (Yielded.from<number>([500, 30, 100, 50])
        .map((value) => sleep(value).then(() => value))
        .parallel(3)
        .toSorted((a, z) => a - z) satisfies Promise<number[]>),
    ).toStrictEqual([30, 50, 100, 500]);
  });

  test("toSorted parallel all", async () => {
    expect(
      await (Yielded.from<number>([500, 30, 100, 50])
        .map((value) => sleep(value).then(() => value))
        .parallel(10)
        .toSorted((a, z) => a - z) satisfies Promise<number[]>),
    ).toStrictEqual([30, 50, 100, 500]);
  });
});
