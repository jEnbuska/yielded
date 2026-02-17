import type {
  IMaybeAsync,
  INextYielded,
  IYieldedFlow,
} from "../../general/types.ts";
import { throttle } from "../../general/utils/parallel.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { ICallbackReturn } from "../types.ts";

export interface IYieldedBatch<T, TFlow extends IYieldedFlow> {
  /**
   * Groups items produced by the generator into batches according to the
   * provided predicate, then feeds each batch as an array to the next
   * operation in the pipeline.
   *
   * The predicate receives the current batch (accumulator) and should return
   * `true` to continue adding items to the current batch, or `false` to
   * close the current batch and start a new one.
   *
   * Supports both synchronous and asynchronous generators. When `TAsync`
   * is `true`, the predicate may return a `Promise<boolean>`, and the
   * batching will correctly handle async evaluations.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3, 4, 5])
   *   .batch(acc => acc.length < 3)
   *   .toArray() satisfies number[][] // [[1, 2, 3], [4, 5]]
   * ```
   * ```ts
   * Yielded.from<number>([])
   *   .batch(acc => acc.length < 3)
   *   .toArray() satisfies number[][] // []
   * ```
   */
  batch(
    predicate: (acc: T[], index: number) => ICallbackReturn<boolean, TFlow>,
  ): INextYielded<T[], TFlow>;
}

export function* batchSync<T>(
  generator: IYieldedSyncGenerator<T>,
  predicate: (acc: T[], index: number) => boolean,
): IYieldedSyncGenerator<T[]> {
  let index = 0;
  let acc: T[] = [];
  for (const next of generator) {
    acc.push(next);
    if (predicate(acc, index++)) continue;
    yield acc;
    acc = [];
  }
  if (acc.length) yield acc;
}

export async function* batchAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  predicate: (batch: T[], index: number) => IMaybeAsync<boolean>,
): IYieldedAsyncGenerator<T[]> {
  let index = 0;
  let acc: T[] = [];
  for await (const next of generator) {
    acc.push(next);
    if (await predicate(acc, index++)) continue;
    yield acc;
    acc = [];
  }
  if (acc.length) yield acc;
}

export function batchParallel<T>(
  predicate: (batch: T[], index: number) => IMaybeAsync<boolean>,
): IParallelGeneratorSubConfig<T, T[]> {
  let index = 0;
  let acc: T[] = [];
  const handleNext = throttle(1, async function onNext(next) {
    acc.push(next);
    const match = await predicate(acc, index++);
    if (match) return [];
    const result = acc;
    acc = [];
    return [result];
  });

  return {
    name: "batch",
    async *onNext(next) {
      yield* await handleNext(next);
    },
    async *onDone() {
      if (acc.length) yield acc;
    },
  };
}
