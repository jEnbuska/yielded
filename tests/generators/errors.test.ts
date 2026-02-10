import { describe, expect, test } from "vitest";
import { Yielded } from "../../src";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("errors", () => {
  describe("should throw error to the callee of last generator middleware", () => {
    createTestSets([1]).modes.forEach(({ mode, yielded }) => {
      test(mode, { timeout: 500 }, async () => {
        async function apply() {
          return yielded
            .tap(() => {
              throw new Error("test error 2");
            })
            .toArray();
        }
        await expect(apply()).rejects.toThrowError("test error");
      });
    });
  });

  describe("should throw error to the callee of second last generator middleware", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        async function apply() {
          return yielded
            .tap(() => {
              throw new Error("test error");
            })
            .map((it) => it * 2)
            .toArray();
        }
        await expect(apply()).rejects.toThrowError("test error");
      });
    });
  });

  describe("should throw error to source throws error", () => {
    test("sync", () => {
      function* generator() {
        yield 1;
        throw new Error("test error");
      }
      expect(
        () =>
          Yielded.from(generator())
            .tap(() => {})
            .toArray() satisfies number[],
      ).toThrowError("test error");
    });
    async function* asyncGenerator() {
      yield 1;
      throw new Error("test error");
    }
    test("async", async () => {
      async function apply() {
        return Yielded.from(asyncGenerator())
          .tap(() => {})
          .toArray() satisfies Promise<number[]>;
      }
      await expect(apply()).rejects.toThrowError("test error");
    });
    test("parallel", async () => {
      async function apply() {
        return Yielded.from(asyncGenerator())
          .parallel(2)
          .tap(() => {})
          .toArray() satisfies Promise<number[]>;
      }
      await expect(apply()).rejects.toThrowError("test error");
    });
  });
});
