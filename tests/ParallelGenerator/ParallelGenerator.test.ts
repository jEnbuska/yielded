import { describe, expect, test } from "vitest";
import { ParallelGenerator } from "../../src/generators/parallel/ParallelGenerator.ts";
import { ParallelYielded } from "../../src/parallel/ParallelYielded.ts";
import { delay } from "../utils/delay.ts";
import { MockIYieldedParallelGenerator } from "../utils/MockGenerators.ts";
import "../utils/initTestPolyfills.ts";
describe("ParallelGenerator", () => {
  describe("handleNext", () => {
    test("empty generator, parallel 1", async () => {
      const generator = ParallelGenerator.create({
        name: "_test",
        generator: MockIYieldedParallelGenerator([]),
        parallel: 1,
        onNext() {
          throw new Error("Should not be called");
        },
      });
      const result = await generator.next();
      expect(result.done).toBe(true);
    });
    test("empty generator, parallel 3", async () => {
      const generator = ParallelGenerator.create({
        name: "_test",
        generator: MockIYieldedParallelGenerator([]),
        parallel: 1,
        onNext() {
          throw new Error("Should not be called");
        },
      });
      const result = await generator.next();
      expect(result.done).toBe(true);
    });

    test("generator with one sync, parallel 1", async () => {
      const generator = ParallelGenerator.create<number, number>({
        name: "_test",
        generator: MockIYieldedParallelGenerator([1]),
        parallel: 1,
        onNext(next) {
          return [next];
        },
      });
      const result1 = await generator.next();
      expect(result1.done).toBe(false);
      expect(await result1.value).toBe(1);
      const result2 = await generator.next();
      expect(result2.done).toBe(true);
    });

    test("generator with 5 sync, parallel 1", async () => {
      const values = [1, Promise.resolve(2), 3, 4, 5];
      const generator = ParallelGenerator.create<number, number>({
        name: "_test",
        generator: MockIYieldedParallelGenerator(values),
        parallel: 1,
        onNext(next) {
          return [next];
        },
      });
      for (const value of values) {
        const result = await generator.next();
        expect(result.done).toBe(false);
        expect(await result.value).toBe(await value);
      }
      const { done } = await generator.next();
      expect(done).toStrictEqual(true);
    });

    test("generator with 5 sync, parallel 5", async () => {
      const values = [1, Promise.resolve(2), 3, 4, 5];
      const generator = ParallelGenerator.create<number, number>({
        name: "_test",
        generator: MockIYieldedParallelGenerator(values),
        parallel: 5,
        onNext(next) {
          return [next];
        },
      });
      for (const value of values) {
        const result = await generator.next();
        expect(result.done).toBe(false);
        expect(await result.value).toBe(await value);
      }
      const { done } = await generator.next();
      expect(done).toStrictEqual(true);
    });
  });
  describe("toArray", () => {
    test("generator with 5 async, parallel 5", async () => {
      const inputTemplate = [
        [1, 300],
        [2, 50],
        [3, 0],
        [4, 200],
        [5, 400],
      ] as const;
      const input = inputTemplate.map(([v, ms]) => delay(v, ms));
      const mock = MockIYieldedParallelGenerator(input);
      const array = await new ParallelYielded(
        mock,
        ParallelGenerator.create<number, number>({
          generator: mock,
          parallel: 5,
          name: "_test",
          onNext(next) {
            return [next];
          },
        }),
        5,
      ).toArray();

      const expected = inputTemplate
        .toSorted((a, b) => a[1] - b[1])
        .map(([v]) => v);
      expect(array).toEqual(expected);
    });

    test("generator with 5 async, parallel 3", async () => {
      const inputTemplate = [
        [1, 300],
        [2, 50],
        [3, 0],
        [4, 200],
        [5, 400],
      ] as const;
      const input = inputTemplate.map(([v, ms]) => delay(v, ms));
      const mock = MockIYieldedParallelGenerator(input);
      const array = await new ParallelYielded(
        mock,
        ParallelGenerator.create<number, number>({
          generator: mock,
          parallel: 3,
          name: "_test",
          onNext(next) {
            return [next];
          },
        }),
        3,
      ).toArray();
      expect(array).toStrictEqual([3, 2, 4, 1, 5]);
    });
    test("generator with 5 async, parallel 2", async () => {
      const inputTemplate = [
        [1, 300],
        [2, 50],
        [3, 0],
        [4, 200],
        [5, 400],
      ] as const;
      const input = inputTemplate.map(([v, ms]) => delay(v, ms));
      const mock = MockIYieldedParallelGenerator(input);
      const array = await new ParallelYielded(
        mock,
        ParallelGenerator.create<number, number>({
          generator: mock,
          parallel: 2,
          name: "_test",
          onNext(next) {
            return [next];
          },
        }),
        2,
      ).toArray();
      expect(array).toStrictEqual([2, 3, 4, 1, 5]);
    });
  });
});
