import type { INextYielded, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";

export interface IYieldedReverse<
  T,
  TFlow extends Exclude<IYieldedFlow, "parallel">,
> {
  /**
   * Yields the items produced by the generator in reverse order.
   *
   * The operator **buffers all items internally**. **No items are yielded
   * downstream until the upstream generator is fully consumed**.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3])
   *   .reversed()
   *   .toArray() satisfies number[] // [3, 2, 1]
   * ```
   * ```ts
   * Yielded.from(['a', 'b', 'c'])
   *   .reversed()
   *   .toArray() satisfies string[] // ['c', 'b', 'a']
   * ```
   */
  reversed(): INextYielded<T, TFlow>;
}

export function* reversedSync<T>(
  generator: IYieldedSyncGenerator<T>,
): IYieldedSyncGenerator<T> {
  const acc: T[] = [];
  for (const next of generator) {
    acc.unshift(next);
  }
  yield* acc;
}

export async function* reversedAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
): IYieldedAsyncGenerator<T> {
  const acc: T[] = [];
  for await (const next of generator) {
    acc.unshift(next);
  }
  yield* acc;
}
