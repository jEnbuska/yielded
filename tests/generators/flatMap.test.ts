import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets, handleExpect } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
import { delay } from "../utils/delay.ts";

describe("flatMap", () => {
  describe("non array", () => {
    const expected = [1, 2, 3];
    createTestSets(expected).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded
          .flatMap((next) => next)
          .toArray()) satisfies Array<number>;
        await handleExpect(mode, result, expected);
      });
    });
  });
  test("flatten non array", () => {
    expect(
      Yielded.from([1, 2, 3])
        .flatMap((it) => it)
        .toArray() satisfies number[],
    ).toStrictEqual([1, 2, 3]);
  });

  describe("from nested arrays", () => {
    const expected = [[1, 2], 3, [4, 5]] satisfies Array<number | number[]>;
    createTestSets([[[1, 2]], [], [3, [4, 5]]]).modes.forEach(
      ({ mode, yielded }) => {
        test(mode, async () => {
          const result = (await yielded
            .flatMap((next) => next)
            .toArray()) satisfies Array<number | number[]>; // [[1,2],3,[4,5]]
          await handleExpect(mode, result, expected);
        });
      },
    );
  });

  describe("from empty", () => {
    createTestSets([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded
          .flatMap((n) => (n % 2 ? new Set([n, n * 10]) : n))
          .toArray()) satisfies number[]; // [1, 10, 2, 3, 30]

        expect(result).toStrictEqual([]);
      });
    });
  });

  describe("from Set", () => {
    const expected = [1, 10, 2, 3, 30];
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded
          .flatMap((n) => (n % 2 ? new Set([n, n * 10]) : n))
          .toArray()) satisfies number[]; // [1, 10, 2, 3, 30]

        await handleExpect(mode, result, expected);
      });
    });
  });

  describe("generators", () => {
    const expected = [1, 10, 2, 3, 4, 5, 3, 30];
    describe("from generator", () => {
      createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
        test(mode, async () => {
          const result = (await yielded
            .flatMap(function* (n) {
              if (n % 2) return yield* new Set([n, n * 10]);
              yield n;
              yield Promise.resolve(n + 1);
              yield* [n + 2, Promise.resolve(n + 3)];
            })
            .toArray()) satisfies Array<Promise<number> | number>;
          await handleExpect(mode, result, expected);
        });
      });
    });

    describe("from async generator", () => {
      createTestSets([1, 2, 3]).allAsyncModes.forEach(({ mode, yielded }) => {
        test(mode, async () => {
          const result = (await yielded
            .flatMap(async function* (n) {
              if (n % 2) return yield* new Set([n, n * 10]);
              yield n;
              yield Promise.resolve(n + 1);
              yield* [n + 2, Promise.resolve(n + 3)];
            })
            .toArray()) satisfies number[];
          await handleExpect(mode, result, expected);
        });
      });
    });

    describe("from async generator delayed", () => {
      createTestSets([1, 2, 3]).allAsyncModes.forEach(({ mode, yielded }) => {
        test(mode, async () => {
          const result = (await yielded
            .flatMap(async function* (n) {
              if (n % 2) return yield* new Set([n, n * 10]);
              yield n;
              yield delay(n + 1, 5);
              yield* [n + 2, delay(n + 3, 5)];
            })
            .toArray()) satisfies number[];
          await handleExpect(mode, result, expected);
        });
      });
    });

    describe("error from async generator", () => {
      createTestSets([1, 2, 3]).allAsyncModes.forEach(({ mode, yielded }) => {
        test(mode, async () => {
          const result = yielded
            .flatMap(async function* (n) {
              yield n;
              throw new Error("Test error");
              yield n + 1;
            })
            .toArray();
          await expect(result).rejects.toThrow("Test error");
        });
      });
    });
    describe("error from generator", () => {
      createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
        test(mode, async () => {
          async function apply() {
            return yielded
              .flatMap(function* (n) {
                yield n;
                throw new Error("Test error");
                yield n + 1;
              })
              .toArray();
          }
          await expect(apply()).rejects.toThrow("Test error");
        });
      });
    });

    describe("error from async list", () => {
      createTestSets([1, 2, 3]).allAsyncModes.forEach(({ mode, yielded }) => {
        test(mode, async () => {
          async function apply() {
            return yielded
              .flatMap((n) => [n, Promise.reject("Test error"), n + 1])
              .toArray();
          }
          await expect(apply()).rejects.toThrow("Test error");
        });
      });
    });
  });
});
