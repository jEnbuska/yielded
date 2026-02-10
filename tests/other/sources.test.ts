import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import "../utils/initTestPolyfills.ts";
describe("sources", () => {
  const numbers = [1, 2, 3];
  function* generatorFunction() {
    yield* numbers;
  }

  test("array", () => {
    expect(Yielded.from(numbers).toArray()).toStrictEqual([1, 2, 3]);
  });

  test("generator function", () => {
    expect(
      Yielded.from(generatorFunction()).toArray() satisfies number[],
    ).toStrictEqual(numbers);
  });

  test("set", () => {
    expect(Yielded.from(new Set(numbers)).toArray().sort()).toStrictEqual(
      [1, 2, 3].sort(),
    );
  });

  test("Iterator", () => {
    expect(
      Yielded.from(Iterator.from(numbers)).toArray() satisfies number[],
    ).toStrictEqual(numbers);
  });
});
