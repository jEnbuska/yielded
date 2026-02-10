import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedToReversed<T, TFlow extends IYieldedFlow> {
  /**
   * Returns the items produced by the generator in reverse order
   * as a new array.
   *
   * Items are inserted into the result incrementally as they are
   * produced by the generator, so the reversal happens **one item
   * at a time** rather than by collecting all items first and
   * reversing afterward.
   *
   * The generator is fully consumed before the final array is returned.
   * @example
   * ```ts
   * Yielded.from([1,2,3])
   *   .toReversed() satisfies number[] // [3,2,1]
   * ```
   **/
  toReversed(): IResolverReturn<T[], TFlow>;
}

export function toReversedSync<T>(generator: IYieldedSyncGenerator<T>): T[] {
  const arr: T[] = [];
  for (const next of generator) {
    arr.unshift(next);
  }
  return arr;
}

export async function toReversedAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
): Promise<T[]> {
  const arr: T[] = [];
  for await (const next of generator) {
    arr.unshift(next);
  }
  return arr;
}

export function toReversedParallel<T>(): IParallelResolverSubConfig<T, T[]> {
  const arr: T[] = [];
  return {
    name: "toReversed",
    onNext(value) {
      arr.unshift(value);
    },
    onDone(resolve) {
      resolve(arr);
    },
  };
}
