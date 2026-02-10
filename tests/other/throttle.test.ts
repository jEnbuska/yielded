import { describe, expect, test } from "vitest";
import { throttle } from "../../src/general/utils/parallel.ts";
import { delay } from "../utils/delay.ts";

describe("throttle", () => {
  test("throttle limits concurrent calls", async () => {
    const throttled = throttle(1, (value: number) => delay(value, 100));

    const start = Date.now();
    const promises = [throttled(1), throttled(2), throttled(3)];
    await Promise.all(promises);
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(300);
  });
});
