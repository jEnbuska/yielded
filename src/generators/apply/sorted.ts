import type {
  IMaybeAsync,
  INextYielded,
  IYieldedFlow,
} from "../../general/types.ts";
import { toSortedAsync, toSortedSync } from "../../resolvers/apply/toSorted.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { ICallbackReturn } from "../types.ts";

export interface IYieldedSorted<
  T,
  TFlow extends Exclude<IYieldedFlow, "parallel">,
> {
  /**
   * Sorts the items produced by the generator according to the provided
   * comparison function, then yields them one by one to the next operation
   * in the pipeline in sorted order.
   *
   * The operator **buffers all items internally** and sorts them incrementally
   * as they arrive. **No items are yielded downstream until the upstream
   * generator is fully consumed**.
   *
   * @example
   * ```ts
   * Yielded.from([3, 2, 1, 4, 5])
   *   .sorted((a, b) => a - b)
   *   .toArray() satisfies number[] // [1, 2, 3, 4, 5]
   * ```
   * ```ts
   * Yielded.from(['banana', 'apple', 'cherry'])
   *   .sorted((a, b) => a.localeCompare(b))
   *   .toArray() satisfies string[] // ['apple', 'banana', 'cherry']
   * ```
   */
  sorted(
    compareFn?: (a: T, b: T) => ICallbackReturn<number, TFlow>,
  ): INextYielded<T, TFlow>;
}

export function* sortedSync<T>(
  generator: IYieldedSyncGenerator<T>,
  compareFn?: (a: T, b: T) => number,
): IYieldedSyncGenerator<T> {
  yield* toSortedSync(generator, compareFn);
}

export async function* sortedAsync<T = never>(
  generator: IYieldedAsyncGenerator<T>,
  compareFn?: (a: T, b: T) => IMaybeAsync<number>,
): IYieldedAsyncGenerator<T> {
  yield* await toSortedAsync(generator, compareFn);
}
