import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";

describe("maxBy", () => {
  const modulo4 = (n: number) => n % 4;

  describe("empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        async function apply(): Promise<number> {
          return yielded.maxBy(modulo4);
        }
        await expect(apply()).rejects.toThrowError(TypeError);
      });
    });
  });

  describe("non empty", () => {
    const { modes } = createTestSets([2, 1, 3, 5, 4]);
    modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const max = (await yielded.maxBy(modulo4)) satisfies number;
        expect(max).toBe(3);
      });
    });
  });

  describe("empty with default", () => {
    const { sync, awaited, parallel, parallelDelayed, mixedParallel } =
      createTestSets([]);
    test("sync", () => {
      const result = sync.maxBy(modulo4, undefined) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });

    test("sync", async () => {
      const result = (await awaited.maxBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });
    test("parallel", async () => {
      const result = (await parallel.maxBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });
    test("parallelDelayed", async () => {
      const result = (await parallelDelayed.maxBy(
        modulo4,
        undefined,
      )) satisfies number | undefined;
      expect(result).toBe(undefined);
    });
    test("mixedParallel", async () => {
      const result = (await mixedParallel.maxBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });
  });

  describe("non empty with default", () => {
    const { sync, awaited, parallel, parallelDelayed, mixedParallel } =
      createTestSets([3]);
    test("sync", () => {
      const result = sync.maxBy(modulo4, undefined) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });

    test("sync", async () => {
      const result = (await awaited.maxBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });
    test("parallel", async () => {
      const result = (await parallel.maxBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });
    test("parallelDelayed", async () => {
      const result = (await parallelDelayed.maxBy(
        modulo4,
        undefined,
      )) satisfies number | undefined;
      expect(result).toBe(3);
    });
    test("mixedParallel", async () => {
      const result = (await mixedParallel.maxBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });
  });
});
