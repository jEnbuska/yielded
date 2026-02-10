import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";

describe("chunkBy", () => {
  describe("chunkBy numbers", () => {
    createTestSets([1, 2, 3, 4, 5]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded
          .chunkBy((n) => n % 2)
          .toArray()) satisfies number[][];

        expect(result).toStrictEqual([
          [1, 3, 5],
          [2, 4],
        ]);
      });
    });
  });

  describe("chunkBy strings", () => {
    createTestSets(["apple", "banana", "apricot", "blueberry"]).modes.forEach(
      ({ mode, yielded }) => {
        test(mode, async () => {
          const result = (await yielded
            .chunkBy((fruit) => fruit[0])
            .toArray()) satisfies string[][];
          expect(result).toStrictEqual([
            ["apple", "apricot"],
            ["banana", "blueberry"],
          ]);
        });
      },
    );
  });

  test("chunkBy strings sync", () => {
    const result = Yielded.from(["apple", "banana", "apricot", "blueberry"])
      .chunkBy((fruit) => fruit[0])
      .toArray() satisfies string[][];
    expect(result).toStrictEqual([
      ["apple", "apricot"],
      ["banana", "blueberry"],
    ]);
  });
});
