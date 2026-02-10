import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";

/* Verify typing after flatmap is expected */
function verify<T>() {
  return (_: T) => {};
}
describe("flat", () => {
  {
    const numbers = [1, 2, 3];
    function flatten<T, const D extends number>(input: T[], depth: D) {
      return (
        Yielded.from(input)
          .tap(verify<FlatArray<T[], 0>>())
          .flat(depth)
          // Verify typing works correctly
          .tap(verify<FlatArray<T[], D>>())
          .toArray()
      );
    }
    describe("depth 0", () => {
      const depth = 0;
      test(`singles`, () => {
        const result: number[] = flatten(numbers, depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`1 deep array`, () => {
        const result: number[][] = flatten([numbers], depth);
        expect(result).toStrictEqual([numbers]);
      });
      test(`2 deep array`, () => {
        const result: number[][][] = flatten([[numbers]], depth);
        expect(result).toStrictEqual([[numbers]]);
      });
    });

    describe("depth 1", () => {
      const depth = 1;
      test(`singles`, () => {
        const result: number[] = flatten(numbers, depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`1 deep array`, () => {
        const result: number[] = flatten([numbers], depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`2 deep array`, () => {
        const result: number[][] = flatten([[numbers]], depth);
        expect(result).toStrictEqual([numbers]);
      });
      test(`3 deep array`, () => {
        const result: number[][][] = flatten([[[numbers]]], depth);
        expect(result).toStrictEqual([[numbers]]);
      });
    });

    describe("depth 2", () => {
      const depth = 2;
      test(`singles`, () => {
        const result: number[] = flatten(numbers, depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`1 deep array`, () => {
        const result: number[] = flatten([numbers], depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`2 deep array`, () => {
        const result: number[] = flatten([[numbers]], depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`3 deep array`, () => {
        const result: number[][] = flatten([[[numbers]]], depth);
        expect(result).toStrictEqual([numbers]);
      });
      test(`4 deep array`, () => {
        const result: number[][][] = flatten([[[[numbers]]]], depth);
        expect(result).toStrictEqual([[numbers]]);
      });
    });

    describe("depth 3", () => {
      const depth = 3;
      test(`singles`, () => {
        const result: number[] = flatten(numbers, depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`1 deep array`, () => {
        const result: number[] = flatten([numbers], depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`2 deep array`, () => {
        const result: number[] = flatten([[numbers]], depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`3 deep array`, () => {
        const result: number[] = flatten([[[numbers]]], depth);
        expect(result).toStrictEqual(numbers);
      });
      test(`4 deep array`, () => {
        const result: number[][] = flatten([[[[numbers]]]], depth);
        expect(result).toStrictEqual([numbers]);
      });
      test(`5 deep array`, () => {
        const result: number[][][] = flatten([[[[[numbers]]]]], depth);
        expect(result).toStrictEqual([[numbers]]);
      });
    });

    describe("mixed", () => {
      const input = [1, [2, [3, [4, [5]]]]];
      test("depth 0", () => {
        const result = flatten(input, 0) satisfies Array<
          number | Array<number | Array<number | Array<number | number[]>>>
        >;
        expect(result).toStrictEqual(input);
      });
      test("depth 1", () => {
        const result = flatten(input, 1) satisfies Array<
          number | Array<number | Array<number | number[]>>
        >;
        expect(result).toStrictEqual([1, 2, [3, [4, [5]]]]);
      });
      test("depth 2", () => {
        const result = flatten(input, 2) satisfies Array<
          number | Array<number | number[]>
        >;
        expect(result).toStrictEqual([1, 2, 3, [4, [5]]]);
      });
      test("depth 3", () => {
        const result = flatten(input, 3) satisfies Array<number | number[]>;
        expect(result).toStrictEqual([1, 2, 3, 4, [5]]);
      });
      test("depth 4", () => {
        const result = flatten(input, 4) satisfies number[];
        expect(result).toStrictEqual([1, 2, 3, 4, 5]);
      });
    });
  }
  const numbers = [[[1, 2]], [], [3, [4, 5]]];
  const {
    fromResolvedPromises,

    fromPromises,
    fromArray,
    empty,
  } = createTestSets(numbers);

  test("from resolved promises", async () => {
    expect(
      await (fromResolvedPromises.flat(5).toArray() satisfies Promise<
        number[]
      >),
    ).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test("from promises", async () => {
    expect(
      (await fromPromises.awaited().flat(5).toArray()) satisfies number[],
    ).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test("from array", () => {
    expect(fromArray.flat(5).toArray() satisfies number[]).toStrictEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  test("from empty", () => {
    expect(empty.flat(5).toArray() satisfies number[]).toStrictEqual([]);
  });

  describe("from documentation", () => {
    test("flat default dept", () => {
      expect(
        Yielded.from([[1], [2], [3]])
          .flat()
          .toArray() satisfies number[],
      ).toStrictEqual([1, 2, 3]);
    });

    test("flat dept 2", () => {
      expect(
        Yielded.from([[1], [[2]], [[[3]]]])
          .flat(2)
          .toArray() satisfies Array<number | number[]>,
      ).toStrictEqual([1, 2, [3]]);
    });
    test("flat default dept mixed values", () => {
      expect(
        Yielded.from([1, [2, [3, 4]], 5])
          .flat()
          .toArray() satisfies Array<number | number[]>,
      ).toStrictEqual([1, 2, [3, 4], 5]);
    });
  });
});
