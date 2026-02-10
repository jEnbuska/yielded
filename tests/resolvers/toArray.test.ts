import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("array resolve tests", () => {
  const numbers = [1, 2, 3];
  const { fromResolvedPromises, fromPromises, fromArray, empty, modes } =
    createTestSets(numbers);
  test("array test set", async () => {
    expect(
      await (fromResolvedPromises.toArray() satisfies Promise<number[]>),
    ).toStrictEqual(numbers);
    expect(
      await Promise.all(
        fromPromises.toArray() satisfies Array<Promise<number>>,
      ),
    ).toStrictEqual(numbers);
    expect(fromArray.toArray() satisfies number[]).toStrictEqual(numbers);
    expect(empty.toArray() satisfies number[]).toStrictEqual([]);
  });

  test("chainable to consume", async () => {
    const result = (await Yielded.from(
      (async function* () {
        yield* await Promise.resolve(numbers);
      })(),
    ).toArray()) satisfies number[];
    expect(result).toStrictEqual(numbers);
  });

  modes.forEach(({ mode, yielded }) => {
    test(`from ${mode}`, async () => {
      const array = (await yielded.toArray()) satisfies Array<number>;
      expect(array).toStrictEqual([1, 2, 3]);
    });
  });
});
