import { describe, expect, test } from "vitest";
import { Yielded } from "../../src";
import { delay } from "../utils/delay.ts";

describe("awaited", () => {
  test("Verify awaited only has one value on in execution at a time", async () => {
    let activeCount = 0;
    const counts: number[] = [];
    await Yielded.from([1, 2, 3, 4, 5])
      .tap(() => counts.push(++activeCount))
      .awaited()
      .map((n) => delay(n, 100))
      .tap(() => counts.push(--activeCount))
      .consume();
    expect(counts).toStrictEqual([1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
  });
});
