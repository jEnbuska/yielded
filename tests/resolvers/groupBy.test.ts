import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("groupBy", () => {
  function group123(n: number) {
    return Math.max(n % 4, 1);
  }
  describe("without groups", () => {
    const {
      sync,
      awaited,
      awaitedDelayed,
      parallel,
      parallelDelayed,
      mixedParallel,
    } = createTestSets([1, 2, 3, 4]);
    const expected = {
      1: [1, 4],
      2: [2],
      3: [3],
    };
    test("sync", () => {
      const groups = sync.groupBy(group123) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited", async () => {
      const groups = (await awaited.groupBy(group123)) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited delayed", async () => {
      const groups = (await awaitedDelayed.groupBy(group123)) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel", async () => {
      const groups = (await parallel.groupBy(group123)) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel delayed", async () => {
      const groups = (await parallelDelayed.groupBy(
        group123,
      )) satisfies Partial<Record<number, number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("mixed parallel", async () => {
      const groups = (await mixedParallel.groupBy(group123)) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
  });
  describe("with groups", () => {
    const {
      sync,
      awaited,
      awaitedDelayed,
      parallel,
      parallelDelayed,
      mixedParallel,
    } = createTestSets([1, 2, 3, 4]);
    const expected = {
      1: [1, 4],
      2: [2],
      3: [3],
      4: [],
    };
    const g = [1, 2, 4] as const;
    test("sync", () => {
      const groups = sync.groupBy(group123, g) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited", async () => {
      const groups = (await awaited.groupBy(group123, g)) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited delayed", async () => {
      const groups = (await awaitedDelayed.groupBy(
        group123,
        g,
      )) satisfies Partial<Record<number, number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel", async () => {
      const groups = (await parallel.groupBy(group123, g)) satisfies Partial<
        Record<number, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel delayed", async () => {
      const groups = (await parallelDelayed.groupBy(
        group123,
        g,
      )) satisfies Partial<Record<number, number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("mixed parallel", async () => {
      const groups = (await mixedParallel.groupBy(
        group123,
        g,
      )) satisfies Partial<Record<number, number[]>>;
      expect(groups).toStrictEqual(expected);
    });
  });

  function evenOdd(n: number) {
    return n % 2 ? "odd" : "even";
  }
  describe("even odd", () => {
    const {
      sync,
      awaited,
      awaitedDelayed,
      parallel,
      parallelDelayed,
      mixedParallel,
    } = createTestSets([1, 2, 3, 4]);
    const expected = {
      odd: [1, 3],
      even: [2, 4],
    };
    test("sync", () => {
      const groups = sync.groupBy(evenOdd) satisfies Partial<
        Record<string, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited", async () => {
      const groups = (await awaited.groupBy(evenOdd)) satisfies Partial<
        Record<string, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited delayed", async () => {
      const groups = (await awaitedDelayed.groupBy(evenOdd)) satisfies Partial<
        Record<string, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel", async () => {
      const groups = (await parallel.groupBy(evenOdd)) satisfies Partial<
        Record<string, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel delayed", async () => {
      const groups = (await parallelDelayed.groupBy(evenOdd)) satisfies Partial<
        Record<string, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
    test("mixed parallel", async () => {
      const groups = (await mixedParallel.groupBy(evenOdd)) satisfies Partial<
        Record<string, number[]>
      >;
      expect(groups).toStrictEqual(expected);
    });
  });

  describe("even odd with groups", () => {
    const g = ["even", "other"] as const;
    const {
      sync,
      awaited,
      awaitedDelayed,
      parallel,
      parallelDelayed,
      mixedParallel,
    } = createTestSets([1, 2, 3, 4]);
    const expected = {
      odd: [1, 3],
      even: [2, 4],
      other: [],
    };
    test("sync", () => {
      const groups = sync.groupBy(evenOdd, g) satisfies Record<
        "even" | "other",
        number[]
      > &
        Partial<Record<"odd", number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited", async () => {
      const groups = (await awaited.groupBy(evenOdd, g)) satisfies Record<
        "even" | "other",
        number[]
      > &
        Partial<Record<"odd", number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("awaited delayed", async () => {
      const groups = (await awaitedDelayed.groupBy(
        evenOdd,
        g,
      )) satisfies Record<"even" | "other", number[]> &
        Partial<Record<"odd", number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel", async () => {
      const groups = (await parallel.groupBy(evenOdd, g)) satisfies Record<
        "even" | "other",
        number[]
      > &
        Partial<Record<"odd", number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("parallel delayed", async () => {
      const groups = (await parallelDelayed.groupBy(
        evenOdd,
        g,
      )) satisfies Record<"even" | "other", number[]> &
        Partial<Record<"odd", number[]>>;
      expect(groups).toStrictEqual(expected);
    });
    test("mixed parallel", async () => {
      const groups = (await mixedParallel.groupBy(evenOdd, g)) satisfies Record<
        "even" | "other",
        number[]
      > &
        Partial<Record<"odd", number[]>>;
      expect(groups).toStrictEqual(expected);
    });
  });

  describe("even odd with groups", () => {
    const expected = {
      odd: [1, 3],
      even: [2, 4],
      other: [],
    };
    test("chainable", () => {
      const groups = Yielded.from([1, 2, 3, 4]).groupBy(evenOdd, [
        "even",
        "other",
      ]) satisfies Record<"even" | "other", number[]> &
        Partial<Record<"odd", number[]>>;
      expect(groups).toStrictEqual(expected);
    });
  });

  describe("even without groups", () => {
    const expected = {
      odd: [1, 3],
      even: [2, 4],
    };
    test("chainable", () => {
      const groups = Yielded.from([1, 2, 3, 4]).groupBy(evenOdd);
      expect(groups).toStrictEqual(expected);
    });
  });

  const numbers = [1, 2, 3];
  const {
    fromResolvedPromises,

    fromPromises,
    fromArray,
    empty,
  } = createTestSets(numbers);
  type ExpectedReturnType = {
    odd: number[];
    even: number[];
  };

  test("from resolved promises", async () => {
    expect(
      await (fromResolvedPromises.groupBy(evenOdd) satisfies Promise<
        Partial<ExpectedReturnType> | undefined
      >),
    ).toStrictEqual({ odd: [1, 3], even: [2] });
  });

  test("from promises", async () => {
    expect(
      (await fromPromises.awaited().groupBy(evenOdd)) satisfies
        | Partial<ExpectedReturnType>
        | undefined,
    ).toStrictEqual({ odd: [1, 3], even: [2] });
  });

  test("from array", () => {
    expect(
      fromArray.groupBy(evenOdd) satisfies Partial<ExpectedReturnType> | void,
    ).toStrictEqual({ odd: [1, 3], even: [2] });
  });

  test("from empty", () => {
    expect(
      empty.groupBy(evenOdd) satisfies Partial<ExpectedReturnType> | void,
    ).toStrictEqual({});
  });
});
