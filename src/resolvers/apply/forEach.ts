import type { IYieldedFlow } from "../../general/types.ts";
import { hasNative } from "../../general/utils/hasNative.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedForEach<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/forEach}   *
   *
   * Invokes the provided callback for each item produced by the generator.
   *
   * Iterates through all items, calling `cb` with the current item and its
   * index. The return value of the callback is ignored.
   *
   * The generator is fully consumed during this operation.
   *
   * @example
   * ```ts
   * Yielded.from([1,2,3])
   *   .forEach((n, i) => {
   *     console.log(i, n);
   *   })
   * // Logs:
   * // 0 1
   * // 1 2
   * // 2 3
   * ```
   */
  forEach(
    cb: (next: T, index: number) => unknown,
  ): IResolverReturn<void, TFlow>;
}

export function forEachSync<T>(
  generator: IYieldedSyncGenerator<T>,
  callback: (next: T, index: number) => unknown,
): void {
  if (hasNative(generator, "forEach")) {
    generator.forEach(callback);
    return;
  }
  let index = 0;
  for (const next of generator) callback(next, index++);
}

export async function forEachAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  callback: (next: T, index: number) => unknown,
): Promise<void> {
  let index = 0;
  for await (const next of generator) callback(next, index++);
}

export function forEachParallel<T>(
  callback: (next: T, index: number) => unknown,
): IParallelResolverSubConfig<T, void> {
  let index = 0;
  return {
    name: "forEach",
    onNext(value) {
      callback(value, index++);
    },
    onDone(resolve) {
      resolve(undefined);
    },
  };
}
