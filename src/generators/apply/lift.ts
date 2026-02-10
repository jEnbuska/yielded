import type { INextYielded, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IYieldedParallelGenerator } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { IYieldedGenerator } from "../types.ts";

export interface IYieldedLift<T, TFlow extends IYieldedFlow> {
  /**
   * Accepts a custom generator function (“middleware”) that receives the
   * current generator and produces a new generator. This allows full control
   * over how items are processed, transformed, or filtered before they
   * continue downstream.
   *
   * The middleware function can yield transformed items of any type `TOut`,
   * and the returned sequence will continue to support chaining of other
   * `Yielded` operations.
   *
   * Supports both synchronous and asynchronous generators. When `TAsync`
   * is `true`, the middleware can yield Promises and the resulting generator
   * will handle them correctly.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3])
   *   .lift(function* multiplyByTwo(generator) {
   *     for (const next of generator) {
   *       yield next * 2;
   *     }
   *   })
   *   .toArray() satisfies number[] // [2, 4, 6]
   * ```
   * ```ts
   * Yielded.from([-2, 1, 2, -3, 4])
   *   .lift(function* filterNegatives(generator) {
   *     for (const next of generator) {
   *       if (next < 0) continue;
   *       yield next;
   *     }
   *   })
   *   .toArray() satisfies number[] // [1, 2, 4]
   * ```
   * ```ts
   * Yielded.from(["a", "b", "c"])
   *   .lift(function* joinStrings(generator) {
   *     const acc: string[] = [];
   *     for (const next of generator) {
   *       acc.push(next);
   *     }
   *     yield acc.join(".");
   *   })
   *   .first() satisfies string | undefined // "a.b.c"
   * ```
   */
  lift<TOut = never>(
    middleware: (
      generator: IYieldedGenerator<T, TFlow>,
    ) => IYieldedGenerator<TOut, TFlow>,
  ): INextYielded<TOut, TFlow>;
}

export function liftSync<T, TOut>(
  generator: IYieldedSyncGenerator<T>,
  middleware: (
    generator: IYieldedSyncGenerator<T>,
  ) => IYieldedSyncGenerator<TOut>,
): IYieldedSyncGenerator<TOut> {
  return middleware(generator);
}

export async function* liftAsync<T, TOut>(
  generator: IYieldedAsyncGenerator<T>,
  middleware: (generator: IYieldedAsyncGenerator<T>) => AsyncGenerator<TOut>,
): IYieldedAsyncGenerator<TOut> {
  for await (const next of middleware(generator)) {
    yield next;
  }
}

export function liftParallel<T, TOut>(
  generator: IYieldedParallelGenerator<T> & Disposable,
  middleware: (
    generator: IYieldedParallelGenerator<T>,
  ) => IYieldedParallelGenerator<TOut>,
): IYieldedParallelGenerator<TOut> {
  // minimal/empty: delegate to middleware and return its generator
  return middleware(generator);
}
