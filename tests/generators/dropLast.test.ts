import { describe, expect, test } from "vitest";
import { Yielded } from "../../src";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("dropLast", () => {
  describe("drop last when array is empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.dropLast(3).toArray()).toStrictEqual([]);
      });
    });
  });

  describe("when count is more than number of inputs", () => {
    createTestSets([1, 2]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.dropLast(3).toArray()).toStrictEqual([]);
      });
    });
  });

  describe("when count is same as than number of inputs", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.dropLast(3).toArray()).toStrictEqual([]);
      });
    });
  });

  describe("when count is 1 less than as than number of inputs", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        expect(await yielded.dropLast(2).toArray()).toStrictEqual([1]);
      });
    });
  });

  describe("when count less than as than number of inputs", () => {
    createTestSets([1, 2, 3, 4, 5]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        let lastEmitted: number | undefined;
        const emittedBySkipLast: Array<{ after: number; value: number }> = [];
        await yielded
          .tap((n) => {
            lastEmitted = n;
          })
          .dropLast(2)
          .tap((n) => {
            emittedBySkipLast.push({ after: lastEmitted!, value: n });
          })
          .consume();
        if (mode === "sync" || mode === "async") {
          expect(emittedBySkipLast).toStrictEqual([
            { after: 3, value: 1 },
            { after: 4, value: 2 },
            { after: 5, value: 3 },
          ]);
        } else {
          const after = emittedBySkipLast.map((it) => it.after);
          const value = emittedBySkipLast.map((it) => it.value);
          expect(Yielded.from(after).maxBy((next) => next)).toBe(5);
          expect(value.sort()).toStrictEqual([1, 2, 3].sort());
        }
      });
    });
  });
});
