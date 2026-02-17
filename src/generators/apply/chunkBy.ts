import type {
  IMaybeAsync,
  INextYielded,
  IYieldedFlow,
} from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { ICallbackReturn } from "../types.ts";

export interface IYieldedChunkBy<T, TFlow extends IYieldedFlow> {
  /**
   * Splits the items produced by the generator into chunks based on the
   * key returned by the provided selector function.
   *
   * Items producing the same key (as returned by `fn`) are grouped together
   * into the same chunk. The order of items within each chunk is preserved
   * according to their original order in the generator.
   *
   * After all items are collected, the chunks (groups) are **yielded as
   * lists** to the next operation in the pipeline.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3, 4, 5])
   *   .chunkBy(n => n % 2)
   *   .toArray() satisfies number[][] // [[1, 3, 5], [2, 4]]
   * ```
   * ```ts
   * Yielded.from(['apple', 'banana', 'apricot', 'blueberry'])
   *   .chunkBy(fruit => fruit[0])
   *   .toArray() satisfies string[][] // [['apple', 'apricot'], ['banana', 'blueberry']]
   */
  chunkBy<TIdentifier>(
    fn: (next: T) => ICallbackReturn<TIdentifier, TFlow>,
  ): INextYielded<T[], TFlow>;
}

export function* chunkBySync<T, TIdentifier = any>(
  generator: IYieldedSyncGenerator<T>,
  keySelector: (next: T) => TIdentifier,
): IYieldedSyncGenerator<T[]> {
  const acc: T[][] = [];
  const indexMap = new Map<TIdentifier, number>();
  for (const next of generator) {
    const key = keySelector(next);
    if (!indexMap.has(key)) {
      indexMap.set(key, acc.length);
      acc.push([]);
    }
    const index = indexMap.get(key)!;
    acc[index]!.push(next);
  }
  yield* acc;
}

export async function* chunkByAsync<T, TIdentifier = any>(
  generator: IYieldedAsyncGenerator<T>,
  keySelector: (next: T) => IMaybeAsync<TIdentifier>,
): IYieldedAsyncGenerator<T[]> {
  const acc: T[][] = [];
  const indexMap = new Map<TIdentifier, number>();
  for await (const next of generator) {
    // Start waiting for the next one even though resolving the key might take a while
    const key = await keySelector(next);
    if (!indexMap.has(key)) {
      indexMap.set(key, acc.length);
      acc.push([]);
    }
    const index = indexMap.get(key)!;
    acc[index]!.push(next);
  }
  yield* acc;
}

export function chunkByParallel<T, TIdentifier = any>(
  keySelector: (next: T) => IMaybeAsync<TIdentifier>,
): IParallelGeneratorSubConfig<T, T[]> {
  const acc: T[][] = [];
  const indexMap = new Map<TIdentifier, number>();
  async function stash(next: T) {
    const key = await keySelector(next);
    if (!indexMap.has(key)) {
      indexMap.set(key, acc.length);
      acc.push([]);
    }
    const index = indexMap.get(key)!;
    acc[index]!.push(next);
  }
  return {
    name: "chunkBy",
    async *onNext(next) {
      await stash(next);
    },
    async *onDone() {
      if (acc.length) return yield* acc;
    },
  };
}
