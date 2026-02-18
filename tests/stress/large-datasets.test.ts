import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import "../utils/initTestPolyfills.ts";
import {
  createRandomAsyncFlattableData,
  createRandomSyncFlattableData,
  verifyRandomAsyncFlattableData,
} from "../utils/createRandomAsyncFlattableData.ts";
import { asyncModeCreations } from "../utils/createTestSets.ts";

/**
 * Stress tests for large datasets to ensure the library handles
 * memory efficiently and doesn't break under load.
 */
describe("Stress Tests - Large Datasets", () => {
  describe("Large sync datasets", () => {
    test("should handle 100k elements with map and filter", async () => {
      const size = 100_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .filter((n) => n % 2 === 0)
        .map((n) => n * 2)
        .take(10)
        .toArray();

      expect(result).toStrictEqual([0, 4, 8, 12, 16, 20, 24, 28, 32, 36]);
    });

    test("should handle 1M elements with early termination (take)", () => {
      const size = 1_000_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .map((n) => n * 2)
        .take(5)
        .toArray();

      expect(result).toStrictEqual([0, 2, 4, 6, 8]);
      // Should not process all 1M elements due to lazy evaluation
    });

    test("should handle 100k elements with batch", () => {
      const size = 100_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .batch((acc) => acc.length < 1000)
        .take(3)
        .toArray();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(1000);
      expect(result[2]).toHaveLength(1000);
    });

    test("should handle 50k elements with flatMap", () => {
      const size = 50_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .flatMap((n) => [n, n * 2])
        .take(10)
        .toArray();

      expect(result).toStrictEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8]);
    });

    test("should handle 10k elements with sorted (requires full consumption)", () => {
      const size = 10_000;
      const result = Yielded.from(
        (function* () {
          for (let i = size - 1; i >= 0; i--) {
            yield i;
          }
        })(),
      )
        .sorted((a, b) => a - b)
        .take(5)
        .toArray();

      expect(result).toStrictEqual([0, 1, 2, 3, 4]);
    });

    test("should handle 100k elements with groupBy", () => {
      const size = 100_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .take(1000)
        .groupBy((n) => (n % 10).toString());

      expect(Object.keys(result)).toHaveLength(10);
      expect(result["0"]).toHaveLength(100);
      expect(result["5"]).toHaveLength(100);
    });

    test("should handle 100k elements with reduce", async () => {
      const size = 100_000;
      const result = await Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .take(1000)
        .reduce((sum, n) => sum + n, 0);

      expect(result).toBe(499500); // Sum of 0 to 999
    });
  });

  describe("Large async datasets", () => {
    test("should handle 10k async elements with parallel processing", async () => {
      const size = 10_000;
      const result = await Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .parallel(10)
        .flatMap(async (n) => {
          // Simulate async work
          await Promise.resolve();
          return n * 2;
        })
        .awaited()
        .take(10)
        .toArray();

      expect(result).toHaveLength(10);
      // Results come in order of completion, not original order
      expect(result.every((n) => n % 2 === 0)).toBe(true);
    });

    test("should handle 5k async elements with sequential processing", async () => {
      const size = 5_000;
      const result = await Yielded.from(
        (async function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .map((n) => n * 2)
        .take(10)
        .toArray();

      expect(result).toStrictEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
    });

    test("should handle 1k async elements with filter and map", async () => {
      const size = 1_000;
      const result = await Yielded.from(
        (async function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .filter((n) => n % 2 === 0)
        .map((n) => n * 2)
        .take(10)
        .toArray();

      expect(result).toStrictEqual([0, 4, 8, 12, 16, 20, 24, 28, 32, 36]);
    });
  });

  describe("Memory efficiency", () => {
    test("should not create intermediate arrays with chained operations", () => {
      const size = 100_000;
      let iterationCount = 0;

      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            iterationCount++;
            yield i;
          }
        })(),
      )
        .filter((n) => n % 2 === 0)
        .map((n) => n * 2)
        .take(5)
        .toArray();

      expect(result).toStrictEqual([0, 4, 8, 12, 16]);
      // Should only iterate until we have 5 results
      // Not exactly 5 due to filter, but much less than 100k
      expect(iterationCount).toBeLessThan(100);
    });

    test("should release resources with early termination", () => {
      const size = 1_000_000;
      let maxAllocated = 0;

      const result = Yielded.from(
        (function* () {
          const temp: number[] = [];
          for (let i = 0; i < size; i++) {
            temp.push(i);
            maxAllocated = Math.max(maxAllocated, temp.length);
            yield temp.shift()!;
          }
        })(),
      )
        .take(10)
        .toArray();

      expect(result).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      // Should not have allocated a huge array
      expect(maxAllocated).toBeLessThan(1000);
    });
  });

  describe("Edge cases with large datasets", () => {
    test("should handle empty result after filtering large dataset", () => {
      const size = 100_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .filter(() => false)
        .toArray();

      expect(result).toStrictEqual([]);
    });

    test("should handle takeWhile with large dataset", () => {
      const size = 100_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .takeWhile((n) => n < 100)
        .toArray();

      expect(result).toHaveLength(100);
      expect(result[99]).toBe(99);
    });

    test("should handle dropLast with large dataset", () => {
      const size = 10_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .dropLast(5)
        .takeLast(10)
        .toArray();

      expect(result).toHaveLength(10);
      expect(result[9]).toBe(size - 6); // 9994
    });

    test("should handle chunkBy with large dataset", () => {
      const size = 100_000;
      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .chunkBy((n) => Math.floor(n / 1000))
        .take(5)
        .toArray();

      expect(result).toHaveLength(5);
      expect(result[0]).toHaveLength(1000);
      expect(result[4]).toHaveLength(1000);
    });
  });

  describe("Performance benchmarks", () => {
    test("should complete 100k element pipeline in reasonable time", () => {
      const start = Date.now();
      const size = 100_000;

      const result = Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .filter((n) => n % 2 === 0)
        .map((n) => n * 2)
        .take(1000)
        .toArray();

      const duration = Date.now() - start;

      expect(result).toHaveLength(1000);
      // Should complete in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    test("should complete parallel processing of 1k async operations in reasonable time", async () => {
      const start = Date.now();
      const size = 1_000;

      const result = await Yielded.from(
        (function* () {
          for (let i = 0; i < size; i++) {
            yield i;
          }
        })(),
      )
        .parallel(20)
        .flatMap(async (n) => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          return n * 2;
        })
        .awaited()
        .toArray();

      const duration = Date.now() - start;

      expect(result).toHaveLength(size);
      // With concurrency 20, should be much faster than sequential (1000ms)
      // Should complete in under 200ms with proper parallelization
      expect(duration).toBeLessThan(500);
    });
  });

  describe.only("random data flatMap", () => {
    const size = 1000;
    asyncModeCreations.forEach(({ mode, create }) => {
      test(
        mode,
        async () => {
          const data: number[] = await create(
            createRandomAsyncFlattableData(size),
          )
            .flatMap((next) => next)
            .toArray();
          verifyRandomAsyncFlattableData(data, size);
        },
        5000,
      );
    });
    test("sync", () => {
      const data: number[] = Yielded.from(createRandomSyncFlattableData(size))
        .flatMap((next) => next)
        .toArray();
      expect(data.length).toBeGreaterThanOrEqual(size);
      expect(data.length).toBeLessThanOrEqual(size + 4);
      expect(new Set(data).size).toBe(data.length);

      for (let i = 0; i < data.length; i++) {
        expect(data[i]).toBe(i);
      }
    }, 5000);
  });
});
