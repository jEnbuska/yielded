import type { INextYielded, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import { assertIsNotZero } from "./utils/take.ts";

export interface IYieldedTake<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/take}
   *
   * Yields only the first `count` items produced by the generator to the
   * next operation in the pipeline, then stops the generator.
   *
   * Once `count` items have been yielded, the generator stops producing
   * further items. Downstream operations continue to receive the items
   * that were yielded.
   *
   * If `count` is greater than the number of items produced, all items
   * are yielded.
   *
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3, 4, 5])
   *   .take(2)
   *   .toArray() satisfies number[] // [1, 2]
   * ```
   * ```ts
   * Yielded.from([1, 2])
   *   .take(5)
   *   .toArray() satisfies number[] // [1, 2]
   * ```
   * ```ts
   * Yielded.from([1, 2, 3, 4, 5])
   *   .take(0)
   *   .toArray() satisfies number[] // []
   * ```
   */
  take(count: number): INextYielded<T, TFlow>;
}

export async function* takeAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  count: number,
): IYieldedAsyncGenerator<T> {
  if (count <= 0) return;
  for await (const next of generator) {
    yield next;
    if (!--count) return;
  }
}

export function takeParallel<T>(count: number): IParallelGeneratorSubConfig<T> {
  assertIsNotZero(count);
  return {
    name: "take",
    onNext(next) {
      if (count-- <= 0) return "STOP";
      return [next];
    },
  };
}
