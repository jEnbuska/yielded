import type { IMaybeAsync } from "../types.ts";

/**
 * Creates a throttled version of the given function that limits
 * how many calls can be actively executing at the same time.
 *
 * Calls beyond the concurrency `limit` are queued and executed
 * in order as earlier calls finish. Each call returns a promise
 * that resolves to the value returned by `cb`.
 *
 * The returned function has an `.all()` method that waits
 * for all throttled calls (both active and queued) to complete.
 *
 * Unlike time-based throttling (e.g., lodash/throttle), this
 * implementation limits **concurrent promise execution** — i.e.,
 * no more than `limit` calls will be running simultaneously.
 * This is useful for controlling load on APIs or async workers.
 *
 * @example
 * ```ts
 * // Create a throttler with concurrency limit 2
 * const limited = throttle(2, async (n: number) => {
 *   await sleep(n);
 *   return n * 2;
 * });
 *
 * // Start several tasks; only 2 will run at once
 * const p1 = limited(100);
 * const p2 = limited(200);
 * const p3 = limited(50);
 *
 * // p1 and p2 start immediately; p3 waits until one finishes
 * console.log(await p1); // 200
 * console.log(await p2); // 400
 * console.log(await p3); // 100
 * ```
 *
 * @example
 * ```ts
 * const limiter = throttle(1, async (name: string) => {
 *   await delay(10);
 *   return name.toUpperCase();
 * });
 *
 * const results = [];
 * limiter("a").then(r => results.push(r));
 * limiter("b").then(r => results.push(r));
 * limiter("c").then(r => results.push(r));
 *
 * // Only one runs at a time; the rest are queued.
 * await limiter.all(); // waits for all three
 * // results might be ['A','B','C']
 * ```
 */
export function throttle<TArgs extends any[], TReturn>(
  limit: number,
  cb: (...args: TArgs) => IMaybeAsync<TReturn>,
) {
  let active = 0;
  if (limit <= 0) {
    throw new RangeError("Limit must be greater than 0");
  }
  const queue: Array<{
    args: TArgs;
    resolvable: PromiseWithResolvers<TReturn>;
  }> = [];
  const inFlight = new Set<Promise<TReturn>>();

  async function processQueue() {
    if (active >= limit) return;
    const next = queue.shift();
    if (!next) return;
    active++;
    const promise = Promise.resolve(cb(...next.args));
    inFlight.add(promise);
    try {
      const result = await promise;
      next.resolvable.resolve(result);
    } catch (error) {
      next.resolvable.reject(error);
    } finally {
      active--;
      inFlight.delete(promise);
      void processQueue();
    }
  }

  return Object.assign(
    function throttledFunction(...args: TArgs): Promise<TReturn> {
      const resolvable = Promise.withResolvers<TReturn>();
      queue.push({ args, resolvable });
      void processQueue();
      return resolvable.promise;
    },
    {
      async all() {
        while (true) {
          await Promise.all(inFlight);
          if (!active && !queue.length) return;
        }
      },
    },
  );
}
export function assertIsValidParallel(parallel: number) {
  if (!Number.isInteger(parallel)) {
    throw new RangeError(`parallel must be an integer but got ${parallel}`);
  }
  if (parallel <= 0) {
    throw new RangeError(
      `parallel must be greater than 0, but got ${parallel}`,
    );
  }
  if (parallel > 50) {
    throw new RangeError(
      `parallel must must be 50 or less, but got ${parallel}`,
    );
  }
}
