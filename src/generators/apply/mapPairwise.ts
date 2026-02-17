import type {
  IMaybeAsync,
  INextYielded,
  IYieldedFlow,
} from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { ICallbackReturn } from "../types.ts";

export interface IYieldedMapPairwise<T, TFlow extends IYieldedFlow> {
  /**
   * Transforms each pair of consecutive items using the provided function
   * and yields the result for each adjacent pair.
   *
   * @example
   * ```ts
   * // pairs are (1,2) and (2,3)
   * Yielded.from([1, 2, 3])
   *   .mapPairwise((previous, next) => previous + next)
   *   .toArray() satisfies number[] // [3, 5]
   * ```
   * ```ts
   * // with no pairs (empty or single-item), nothing is emitted
   * Yielded.from([42])
   *   .mapPairwise((a, b) => a - b)
   *   .toArray() satisfies number[] // []
   * ```
   */
  mapPairwise<TOut>(
    mapper: (previous: T, next: T) => ICallbackReturn<TOut, TFlow>,
  ): INextYielded<TOut, TFlow>;
}
export function* mapPairwiseSync<T, TOut>(
  generator: IYieldedSyncGenerator<T>,
  mapper: (previous: T, next: T) => TOut,
): IYieldedSyncGenerator<TOut> {
  let previous: { value: T } | undefined = undefined;
  for (const next of generator) {
    if (previous) {
      yield mapper(previous.value, next);
    }
    previous = { value: next };
  }
}

export async function* mapPairwiseAsync<T, TOut>(
  generator: IYieldedAsyncGenerator<T>,
  mapper: (previous: T, next: T) => IMaybeAsync<TOut>,
): IYieldedAsyncGenerator<TOut> {
  let previous: { value: T } | undefined = undefined;
  for await (const next of generator) {
    if (previous) {
      yield mapper(previous.value, next);
    }
    previous = { value: next };
  }
}

export function mapPairwiseParallel<T, TOut>(
  mapper: (previous: T, next: T) => IMaybeAsync<TOut>,
): IParallelGeneratorSubConfig<T, TOut> {
  let previous: { value: T } | undefined = undefined;
  return {
    name: "mapPairwise",
    async *onNext(next) {
      if (!previous) {
        previous = { value: next };
      } else {
        const currentPrevious = previous.value;
        previous = { value: next };
        return yield mapper(currentPrevious, next);
      }
    },
  };
}
