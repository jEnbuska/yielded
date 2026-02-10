import { describe, expect, test, vi } from "vitest";
import { ParallelGeneratorResolver } from "../../src/resolvers/parallel/ParallelGeneratorResolver.ts";
import {
  MockDelayedValuesGenerator,
  MockIYieldedParallelGenerator,
} from "../utils/MockGenerators.ts";

describe("ParallelGeneratorResolver", () => {
  test("Empty parallel 1", async () => {
    const result = await ParallelGeneratorResolver.run<number, boolean>({
      name: "_test",
      generator: MockIYieldedParallelGenerator([]),
      parallel: 1,
      onNext() {},
      onDone(resolve) {
        resolve(true);
      },
    });
    expect(result).toBe(true);
  });

  test("One value parallel 1", async () => {
    const acc: number[] = [];
    const result = await ParallelGeneratorResolver.run<number, number[]>({
      name: "_test",
      generator: MockIYieldedParallelGenerator([1]),
      parallel: 1,
      onNext(value) {
        acc.push(value);
      },
      onDone(resolve) {
        resolve(acc);
      },
    });
    expect(result).toStrictEqual([1]);
  });

  test("10 values parallel 3", async () => {
    const acc: number[] = [];
    const result = await ParallelGeneratorResolver.run<number, number[]>({
      name: "_test",
      generator: MockDelayedValuesGenerator(vi.useFakeTimers(), [
        [1000, 1], // (0-1000) 7
        [0, 2], // (0-0) 1
        [500, 3], // (0-500) 4
        [100, 4], // (0-100) 2
        [200, 5], // (100-300) 3
        [300, 6], // (300-600) 5
        [400, 7], // (500-900) 6
        [600, 8], // (600-1200) 8
        [700, 9], // (900-1600) 9
        [800, 10], // (1200-2000) 10
      ]),
      parallel: 3,
      onNext(value) {
        acc.push(value);
      },
      onDone(resolve) {
        resolve(acc);
      },
    });
    expect(result).toStrictEqual([2, 4, 5, 3, 6, 7, 1, 8, 9, 10]);
  });

  test("10 values parallel 15", async () => {
    const acc: number[] = [];
    const result = ParallelGeneratorResolver.run<number, number[]>({
      name: "_test",
      generator: MockDelayedValuesGenerator(vi.useFakeTimers(), [
        [1000, 1],
        [0, 2],
        [500, 3],
        [100, 4],
        [200, 5],
        [300, 6],
        [400, 7],
        [600, 8],
        [700, 9],
        [800, 10],
      ]),
      parallel: 15,
      onNext(value) {
        acc.push(value);
      },
      onDone(resolve) {
        resolve(acc);
      },
    });
    expect(await result).toStrictEqual([2, 4, 5, 6, 7, 3, 8, 9, 10, 1]);
  });

  test("5 values parallel 5", async () => {
    const acc: number[] = [];
    const result = ParallelGeneratorResolver.run<number, number[]>({
      name: "_test",
      generator: MockDelayedValuesGenerator(vi.useFakeTimers(), [
        [0, 1],
        [100, 2],
        [200, 3],
        [600, 4],
        [400, 5],
      ]),
      parallel: 5,
      onNext(value) {
        acc.push(value);
      },
      onDone(resolve) {
        resolve(acc);
      },
    });
    expect(await result).toStrictEqual([1, 2, 3, 5, 4]);
  });
});
