import { describe, expect, test } from "vitest";
import type { IYieldedFlow } from "../../src/general/types.ts";
import type { IYieldedReduce } from "../../src/resolvers/apply/reduce.ts";
import { createTestSets } from "../utils/createTestSets.ts";

describe("reduce", () => {
  describe("sum chainable", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ yielded, mode }) => {
      test(mode, async () => {
        const sum = await yielded.reduce((acc, v) => acc + v);
        expect(sum).toBe(6);
      });
    });
  });

  describe("empty sum", () => {
    createTestSets<number>([]).modes.forEach(({ yielded, mode }) => {
      test(`${mode} with initial value `, async () => {
        const sum = (await (
          yielded as IYieldedReduce<number, IYieldedFlow>
        ).reduce((acc, v) => acc + v, 0)) satisfies number;
        expect(sum).toBe(0);
      });
    });
    createTestSets<number>([]).modes.forEach(({ yielded, mode }) => {
      test(`${mode} with out value `, async () => {
        const call = async (): Promise<number> => {
          return (yielded as IYieldedReduce<number, IYieldedFlow>).reduce(
            (acc, v) => acc + v,
          );
        };
        await expect(call()).rejects.toThrowError(TypeError);
      });
    });
  });

  describe("to array", () => {
    createTestSets<number>([1, 2, 3]).modes.forEach(({ yielded, mode }) => {
      test(`${mode}  `, async () => {
        const array = await (
          yielded as IYieldedReduce<number, IYieldedFlow>
        ).reduce<number[]>((acc, v) => [...acc, v], []);
        expect(array).toStrictEqual([1, 2, 3]);
      });
    });
  });
});
