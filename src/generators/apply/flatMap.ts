import type {
  IMaybeAsync,
  INextYielded,
  IYieldedFlow,
  IYieldedIterableSource,
} from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { ICallbackReturn } from "../types.ts";
import {
  asyncIterableProviderToAsyncIterable,
  isAsyncIterableProvider,
  isIterableProvider,
  iterableProviderToIterable,
} from "./utils/iteration.ts";

export interface IYieldedFlatMap<T, TFlow extends IYieldedFlow> {
  /**
   * See Iterator API {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/flatMap}
   *
   * See Array API {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap}
   *
   * Maps each item produced by the generator using the provided mapper function
   * and flattens the result one level before yielding items to the next operation.
   *
   * The mapper may return:
   * - a single item (`TOut`)
   * - an array of items (`readonly TOut[]`)
   * - any iterable of items (`Iterable<TOut>)`)
   *
   * This allows combining the accepted outputs of both `Array.flatMap` and
   * `Iterable.flatMap` into a single operator.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3])
   *   .flatMap(n => [n, n * 2])
   *   .toArray() satisfies number[] // [1, 2, 2, 4, 3, 6]
   * ```
   * @example
   * ```ts
   * Yielded.from([1, 2, 3])
   *   .flatMap(n => n % 2 ? new Set([n, n*10]) : n)
   *   .toArray() satisfies number[] // [1, 10, 2, 3, 30]
   * ```
   */
  flatMap<TOut>(
    mapper: (
      next: T,
      index: number,
    ) => ICallbackReturn<
      readonly TOut[] | IYieldedIterableSource<TOut, TFlow> | TOut,
      TFlow
    >,
  ): INextYielded<TOut, TFlow>;
}

export function* flatMapSync<T, TOut>(
  generator: IYieldedSyncGenerator<T>,
  callback: (
    next: T,
    index: number,
  ) => readonly TOut[] | IYieldedIterableSource<TOut, "sync"> | TOut,
): IYieldedSyncGenerator<TOut> {
  let index = 0;
  for (const next of generator) {
    const out = callback(next, index++);
    if (isIterableProvider<TOut>(out)) {
      yield* iterableProviderToIterable<TOut>(out);
    } else {
      yield out;
    }
  }
}

export async function* flatMapAsync<T, TOut>(
  generator: IYieldedAsyncGenerator<T>,
  callback: (
    next: T,
    index: number,
  ) => IMaybeAsync<
    readonly TOut[] | IYieldedIterableSource<TOut, "async"> | TOut
  >,
): IYieldedAsyncGenerator<TOut> {
  let index = 0;
  for await (const next of generator) {
    const out = await callback(next, index++);
    if (isAsyncIterableProvider<TOut>(out)) {
      const iterable = asyncIterableProviderToAsyncIterable<TOut>(out);
      for await (const item of iterable) {
        yield item;
      }
    } else {
      yield out;
    }
  }
}

export function flatMapParallel<T, TOut>(
  callback: (
    next: T,
    index: number,
  ) => IMaybeAsync<
    readonly TOut[] | IYieldedIterableSource<TOut, "parallel"> | TOut
  >,
): IParallelGeneratorSubConfig<T, TOut> {
  let index = 0;
  return {
    name: "flatMap",
    async *onNext(next) {
      const value = await callback(next, index++);
      if (!isAsyncIterableProvider<TOut>(value)) return yield value;
      const iterable = asyncIterableProviderToAsyncIterable<TOut>(value);
      for await (const item of iterable) {
        yield item;
      }
    },
  };
}
