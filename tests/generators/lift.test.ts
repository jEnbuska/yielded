import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import "../utils/initTestPolyfills.ts";
describe("lift", () => {
  test("lift mapper", () => {
    const array = Yielded.from([1, 2, 3])
      .lift(function* multiplyByTwo(generator) {
        for (const next of generator) {
          yield next * 2;
        }
      })
      .toArray();
    expect(array).toStrictEqual([2, 4, 6]);
  });

  test("lift filter", () => {
    const array = Yielded.from([-2, 1, 2, -3, 4])
      .lift(function* filterNegatives(generator) {
        for (const next of generator) {
          if (next < 0) continue;
          yield next;
        }
      })
      .toArray();
    expect(array).toStrictEqual([1, 2, 4]);
  });

  test("lift aggregate", () => {
    const text = Yielded.from(
      (function* () {
        yield* ["a", "b", "c"];
      })(),
    )
      .lift(function* joinStrings(generator) {
        const acc: string[] = [];
        for (const next of generator) {
          acc.push(next);
        }
        yield acc.join(".");
      })
      .first() satisfies string | undefined;
    expect(text).toBe("a.b.c");
  });

  test("lift async", async () => {
    const text = (await Yielded.from(
      (async function* () {
        yield "a";
        yield "b";
        yield "c";
      })(),
    )
      .lift(async function* joinStrings(generator) {
        const acc: string[] = [];
        for await (const next of generator) {
          acc.push(next);
        }
        yield acc.join(".");
      })
      .toArray()) satisfies string[];
    expect(text).toStrictEqual(["a.b.c"]);
  });
});
