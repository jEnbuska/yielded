import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";

describe("find", () => {
  const numbers = [1, 2, 3];
  describe("find first", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.find((it) => it === 1)) satisfies number | undefined,
        ).toBe(1);
      });
    });
  });

  describe("find second", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.find((it) => it === 2)) satisfies number | undefined,
        ).toBe(2);
      });
    });
  });

  describe("find last", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.find((it) => it === 3)) satisfies number | undefined,
        ).toBe(3);
      });
    });
  });

  describe("find none", () => {
    createTestSets(numbers).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(
          (await yielded.find((it) => it === 4)) satisfies number | undefined,
        ).toBe(undefined);
      });
    });
  });

  test("find with type-guard", () => {
    expect(
      Yielded.from(numbers).find((it): it is 1 => it === 1) satisfies
        | 1
        | undefined,
    ).toStrictEqual(1);
  });

  function find2(value: number) {
    return value === 2;
  }

  describe("from empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect((await yielded.find(find2)) satisfies number | void).toBe(
          undefined,
        );
      });
    });
  });
});
