import type { INextYielded, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";

export interface IYieldedDrop<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/drop}
   *
   * Skips the first `count` items produced by the generator, then yields
   * the remaining items to the next operation in the pipeline.
   *
   * Items are not passed downstream until the specified number of items
   * has been dropped. If `count` is greater than the number of items
   * produced, no items will be yielded.
   *
   * Supports both synchronous and asynchronous generators. When `TAsync`
   * is `true`, items will be yielded asynchronously.
   *d
   * @example
   * ```ts
   * Yielded.from([1, 2, 3, 4, 5])
   *   .drop(2)
   *   .toArray() satisfies number[] // [3, 4, 5]
   * ```
   * ```ts
   * Yielded.from([1, 2])
   *   .drop(5)
   *   .toArray() satisfies number[] // []
   * ```
   */
  drop(count: number): INextYielded<T, TFlow>;
}

export async function* dropAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  count: number,
): IYieldedAsyncGenerator<T> {
  for await (const next of generator) {
    if (count) {
      count--;
      continue;
    }
    yield next;
  }
}

export function dropParallel<T>(
  count: number,
): IParallelGeneratorSubConfig<T, T> {
  return {
    name: "drop",
    onNext(next) {
      if (count > 0) {
        count--;
        return;
      }
      return [next];
    },
  };
}
