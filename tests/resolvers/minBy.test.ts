import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";

describe("minBy", () => {
  const modulo4 = (n: number) => n % 4;

  describe("empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        async function apply(): Promise<number> {
          return yielded.minBy(modulo4);
        }
        await expect(apply()).rejects.toThrowError(TypeError);
      });
    });
  });

  describe("non empty", () => {
    const { modes } = createTestSets([2, 1, 3, 5, 4]);
    modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const max = (await yielded.minBy(modulo4)) satisfies number;
        expect(max).toBe(4);
      });
    });
  });

  describe("with aborted signal", () => {
    const { modes } = createTestSets([2, 1, 3, 5, 4]);
    modes.forEach(({ mode, yielded }) => {
      const controller = new AbortController();
      controller.abort();
      test(mode, async () => {
        async function apply(): Promise<number> {
          return yielded.withSignal(controller.signal).minBy(modulo4);
        }
        await expect(apply()).rejects.toThrowError(TypeError);
      });
    });
  });

  describe("with aborted signal and default", () => {
    const { sync, awaited, parallel, parallelDelayed, mixedParallel } =
      createTestSets([2, 1, 3, 5, 4]);
    const controller = new AbortController();
    controller.abort();
    test("sync", () => {
      expect(
        sync.withSignal(controller.signal).minBy(modulo4, "0") satisfies
          | number
          | string,
      ).toBe("0");
    });
    test("awaited", async () => {
      expect(
        (await awaited
          .withSignal(controller.signal)
          .minBy(modulo4, "0")) satisfies number | string,
      ).toBe("0");
    });
    test("parallel", async () => {
      expect(
        (await parallel
          .withSignal(controller.signal)
          .minBy(modulo4, "0")) satisfies number | string,
      ).toBe("0");
    });
    test("parallelDelayed", async () => {
      expect(
        (await parallel
          .withSignal(controller.signal)
          .minBy(modulo4, "0")) satisfies number | string,
      ).toBe("0");
    });
    test("mixedParallel", async () => {
      expect(
        (await parallel
          .withSignal(controller.signal)
          .minBy(modulo4, "0")) satisfies number | string,
      ).toBe("0");
    });
  });

  describe("with signal aborted during run", () => {
    const { modes } = createTestSets([2, 1, 3, 5, 4]);
    modes.forEach(({ mode, yielded }) => {
      const controller = new AbortController();
      test(mode, async () => {
        const result = (await yielded
          .tap((_, index) => {
            if (index === 2) controller.abort();
          })
          .withSignal(controller.signal)
          .minBy(modulo4)) satisfies number | undefined;
        expect(result).not.toBeUndefined();
      });
    });
  });

  describe("empty with default", () => {
    const { sync, awaited, parallel, parallelDelayed, mixedParallel } =
      createTestSets([]);
    test("sync", () => {
      const result = sync.minBy(modulo4, undefined) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });

    test("sync", async () => {
      const result = (await awaited.minBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });
    test("parallel", async () => {
      const result = (await parallel.minBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });
    test("parallelDelayed", async () => {
      const result = (await parallelDelayed.minBy(
        modulo4,
        undefined,
      )) satisfies number | undefined;
      expect(result).toBe(undefined);
    });
    test("mixedParallel", async () => {
      const result = (await mixedParallel.minBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(undefined);
    });
  });

  describe("non empty with default", () => {
    const { sync, awaited, parallel, parallelDelayed, mixedParallel } =
      createTestSets([3]);
    test("sync", () => {
      const result = sync.minBy(modulo4, undefined) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });

    test("sync", async () => {
      const result = (await awaited.minBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });
    test("parallel", async () => {
      const result = (await parallel.minBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });
    test("parallelDelayed", async () => {
      const result = (await parallelDelayed.minBy(
        modulo4,
        undefined,
      )) satisfies number | undefined;
      expect(result).toBe(3);
    });
    test("mixedParallel", async () => {
      const result = (await mixedParallel.minBy(modulo4, undefined)) satisfies
        | number
        | undefined;
      expect(result).toBe(3);
    });
  });
});
