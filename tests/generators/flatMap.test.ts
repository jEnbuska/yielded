import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";

describe("flatMap", () => {
  test("flatten non array", () => {
    expect(
      Yielded.from([1, 2, 3])
        .flatMap((it) => it)
        .toArray() satisfies number[],
    ).toStrictEqual([1, 2, 3]);
  });

  const numbers = [[[1, 2]], [], [3, [4, 5]]] satisfies Array<
    number | Array<number | number[]>
  >;
  const expected = [[1, 2], 3, [4, 5]] satisfies Array<number | number[]>;
  const {
    fromResolvedPromises,

    fromPromises,
    fromArray,
    empty,
  } = createTestSets(numbers);

  test("from resolved promises", async () => {
    expect(
      await (fromResolvedPromises
        .flatMap((next) => next)
        .toArray() satisfies Promise<Array<number | number[]>>),
    ).toStrictEqual(expected);
  });

  test("from promises", async () => {
    expect(
      (await fromPromises
        .awaited()
        .flatMap((next) => next)
        .toArray()) satisfies Array<number | number[]>,
    ).toStrictEqual(expected);
  });

  test("from array", () => {
    expect(
      fromArray.flatMap((next) => next).toArray() satisfies Array<
        number | number[]
      >,
    ).toStrictEqual(expected);
  });

  test("from empty", () => {
    expect(
      empty.flatMap((next) => next).toArray() satisfies Array<
        number | number[]
      >,
    ).toStrictEqual([]);
  });

  test("from Set", () => {
    const result = Yielded.from([1, 2, 3])
      .flatMap((n) => (n % 2 ? new Set([n, n * 10]) : n))
      .toArray() satisfies number[]; // [1, 10, 2, 3, 30]

    expect(result).toStrictEqual([1, 10, 2, 3, 30]);
  });

  test("from iterable", () => {
    const result = Yielded.from([1, 2, 3])
      .flatMap(function* (n) {
        if (n % 2) return yield* new Set([n, n * 10]);
        yield n;
        yield* [n + 1];
      })
      .toArray() satisfies number[];

    expect(result).toStrictEqual([1, 10, 2, 3, 3, 30]);
  });

  test("from async iterable", async () => {
    const result = (await Yielded.from([1, 2, 3])
      .awaited()
      .flatMap(async function* (n) {
        if (n % 2) return yield* new Set([n, n * 10]);
        yield n;
        yield Promise.resolve(n + 1);
        yield* [n + 2, Promise.resolve(n + 3)];
      })
      .toArray()) satisfies number[];

    expect(result).toStrictEqual([1, 10, 2, 3, 4, 5, 3, 30]);
  });

  test("from parallel iterable", async () => {
    const result = (await Yielded.from([1, 2, 3])
      .parallel(3)
      .flatMap(async function* (n) {
        if (n % 2) return yield* new Set([n, n * 10]);
        yield n;
        yield Promise.resolve(n + 1);
        yield* [n + 2, Promise.resolve(n + 3)];
      })
      .toArray()) satisfies number[];

    expect(result.sort()).toStrictEqual([1, 10, 2, 3, 4, 5, 3, 30].sort());
  });
});
