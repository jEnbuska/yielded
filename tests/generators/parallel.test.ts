import { describe, expect, test } from "vitest";
import { Yielded } from "../../src/index.ts";
import { delay } from "../utils/delay.ts";
import "../utils/initTestPolyfills.ts";

describe("parallel", () => {
  test("Parallel 2, 0 values", async () => {
    const result = (await Yielded.from<number>([])
      .parallel(2)
      .toArray()) satisfies number[];
    expect(result).toStrictEqual([]);
  });

  test("Parallel to awaited", async () => {
    const result = (await Yielded.from([120, 250, 50, 50, 50] as number[])
      .parallel(3)
      .map((it) => delay(it, it))
      .awaited()
      .toArray()) satisfies number[];
    expect(result).toStrictEqual([50, 50, 120, 50, 250]);
  });

  test("Parallel awaited to parallel", async () => {
    const result = (await Yielded.from([120, 250, 50, 50, 50] as number[])
      .parallel(3)
      .map((it) => delay(it, it))
      .awaited()
      .parallel(3)
      .map((it) => delay(it, it))
      .toArray()) satisfies number[];
    expect(result).toStrictEqual([50, 50, 50, 120, 250]);
  });

  test("Parallel to parallel", async () => {
    const result = (await Yielded.from([120, 250, 50, 50, 50] as number[])
      .parallel(3)
      .map((it) => delay(it, it))
      .parallel(3)
      .map((it) => delay(it, it))
      .toArray()) satisfies number[];
    expect(result).toStrictEqual([50, 50, 50, 120, 250]);
  });
  test("Parallel 5, 5 values", async () => {
    const result = await (Yielded.from([500, 404, 100, 300, 200])
      .map((it) => delay(it, it))
      .parallel(5)
      .toArray() satisfies Promise<number[]>);
    expect(result).toStrictEqual([100, 200, 300, 404, 500]);
  });

  test("Parallel 3, 5 values", async () => {
    const result = (await Yielded.from([550, 450, 300, 10, 100])
      .parallel(3)
      .map((it) => delay(it, it))
      // 550 (0),   450(0),     300(0)    -> 300
      // 550 (250), 450 (150),  10 (10)   -> 10
      // 550 (240), 450 (140),  100 (100) -> 100
      // 550 (140), 450 (40)              -> 450
      // 550 (100)                        -> 550
      // [300, 10, 100, 450, 550]
      .toArray()) satisfies number[];
    expect(result).toStrictEqual([300, 10, 100, 450, 550]);
  });

  test("Parallel 2, 5 values", async () => {
    const result = (await Yielded.from([550, 450, 300, 10, 50])
      .parallel(2)
      .map((it) => delay(it, it))
      .toArray()) satisfies number[];
    expect(result).toStrictEqual([450, 550, 10, 50, 300]);
  });

  describe("Parallel to awaited", () => {
    test("Parallel 3, 5 values to awaited", async () => {
      const result = (await Yielded.from([300, 10, 100, 450, 550])
        .parallel(3)
        .awaited()
        .map((it) => delay(it, it))
        .toArray()) satisfies number[];
      expect(result).toStrictEqual([300, 10, 100, 450, 550]);
    });

    test("Parallel to awaited execution order testing", async () => {
      const executions: string[] = [];
      await Yielded.from([1, 2, 3, 4, 5])
        .parallel(3)
        .tap((n) => executions.push(`A:${n}`))
        .map((n, i) => delay(n, 100 + i * 10))
        .awaited()
        .tap((n) => executions.push(`B:${n}`))
        .consume();
      expect(executions).toStrictEqual(
        [
          ["A:1", "A:2", "A:3"],
          ["B:1", "A:4"],
          ["B:2", "A:5"],
          ["B:3", "B:4", "B:5"],
        ].flat(),
      );
    });

    test("Parallel to awaited execution limit testing", async () => {
      let totalExecutions = 0;
      let totalMax = 0;
      let parallelMax = 0;
      let parallelExecutions = 0;
      let awaitedMax = 0;
      let awaitedExecutions = 0;
      await Yielded.from([1, 2, 3, 4, 5, 6, 7, 8])
        .parallel(3)
        .tap(() => {
          parallelExecutions++;
          parallelMax = Math.max(parallelExecutions, parallelMax);
          totalExecutions++;
          totalMax = Math.max(totalExecutions, totalMax);
        })
        .map((n, i) => delay(n, i * 5))
        .tap(() => {
          parallelExecutions--;
          totalExecutions--;
        })
        .awaited()
        .tap(() => {
          awaitedExecutions++;
          awaitedMax = Math.max(awaitedExecutions, awaitedMax);
          totalExecutions++;
          totalMax = Math.max(totalExecutions, totalMax);
        })
        .map((n, i) => delay(n, i * 5))
        .tap(() => {
          awaitedExecutions--;
          totalExecutions--;
        })
        .consume();
      expect(awaitedMax).toBe(1);
      expect(parallelMax).toBe(3);
      expect(totalMax).toBe(3);
    });
  });
});
