import type { INextYielded, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";

export interface IYieldedTakeLast<T, TFlow extends IYieldedFlow> {
  /**
   * Yields only the last `count` items produced by the generator to the
   * next operation in the pipeline.
   *
   * The operator buffers items internally. The number of items specified
   * by `count` will be kept in memory, and **no items are yielded to the
   * next operation until the upstream generator is fully consumed**.
   *
   * If the generator produces fewer items than `count`, all items are yielded.
   *
   * @example
   * ```ts
   * Yielded.from([1,2,3,4,5])
   *  .takeLast(2)
   *  .toArray() satisfies number[] // [4,5]
   *  ```
   * ```ts
   * Yielded.from([1, 2])
   *   .takeLast(5)
   *   .toArray() satisfies number[] // [1, 2]
   *   ```
   */
  takeLast(count: number): INextYielded<T, TFlow>;
}

export function* takeLastSync<T>(
  generator: IYieldedSyncGenerator<T>,
  count: number,
): IYieldedSyncGenerator<T> {
  const acc: T[] = [];
  for (const next of generator) {
    acc.push(next);
    if (acc.length > count) acc.shift();
  }
  yield* acc;
}

export async function* takeLastAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  count: number,
): IYieldedAsyncGenerator<T> {
  const acc: T[] = [];
  for await (const next of generator) {
    acc.push(next);
    if (acc.length > count) acc.shift();
  }
  yield* acc;
}

export function takeLastParallel<T>(
  count: number,
): IParallelGeneratorSubConfig<T> {
  const acc: Array<T> = [];
  return {
    name: "takeLast",
    async *onNext(next) {
      acc.push(next);
      if (acc.length > count) acc.shift();
    },
    async *onDone() {
      yield* acc;
    },
  };
}
