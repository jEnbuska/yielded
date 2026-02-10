import type { IMaybeAsync, IYieldedFlow } from "../../general/types.ts";
import { hasNative } from "../../general/utils/hasNative.ts";
import { throttle } from "../../general/utils/parallel.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import type { ICallbackReturn } from "../../generators/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";
import { getEmptySlot, isEmptySlot } from "./utils/emptySlot.ts";

export interface IYieldedReduce<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/reduce}
   *
   * Reduces the items produced by the generator into a single value.
   *
   * Iterates through all items in the generator, passing each item and
   * the accumulated result to the provided `reducer` function. The value
   * returned by the reducer becomes the accumulator for the next iteration.
   *
   * There are two modes:
   *
   * 1. **With `initialValue`**
   *    The accumulator is initialized to the provided `initialValue`. This
   *    overload always returns a resolved value of type `TOut`.
   *
   * 2. **Without `initialValue`**
   *    The first item of the generator is used as the initial accumulator.
   *    If the generator is empty, the result is `undefined`.
   *
   * @example
   * ```ts
   * // With `initialValue`
   * Yielded.from([1,2,3,4,5])
   *   .reduce((sum, n) => sum + n, 0) satisfies number // 15
   *   ```
   * ```ts
   * // Without `initialValue`
   * Yielded.from([1,2,4,3])
   *   .reduce((acc, next) => acc < next ? next : acc) satisfies number // 4
   * ```
   * ```ts
   * // Without `initialValue` and no values produced
   * Yielded.from<number>([])
   *   .reduce((acc, next) => acc < next ? next : acc) satisfies number // throw TypeError
   * ```
   * ```ts
   * // With `initialValue`
   * Yielded.from<number>([])
   *   .reduce((sum, n) => sum + n, 0) satisfies number // 0
   * ```
   */
  reduce<TOut>(
    reducer: (
      acc: TOut,
      next: T,
      index: number,
    ) => ICallbackReturn<TOut, TFlow>,
    initialValue: TFlow extends "sync" ? TOut : Promise<TOut> | TOut,
  ): IResolverReturn<TOut, TFlow>;
  reduce(
    reducer: (acc: T, next: T, index: number) => ICallbackReturn<T, TFlow>,
  ): IResolverReturn<T, TFlow>;
}

export function reduceSync<T>(
  generator: IYieldedSyncGenerator<T>,
  reducer: (acc: T, next: T, index: number) => T,
): T;
export function reduceSync<T, TOut>(
  generator: IYieldedSyncGenerator<T>,
  reducer: (acc: TOut, next: T, index: number) => TOut,
  initialValue: TOut,
): TOut;
export function reduceSync(
  generator: IYieldedSyncGenerator,
  reducer: (acc: unknown, next: unknown, index: number) => unknown,
  ...rest: [unknown] | []
): unknown {
  if (hasNative(generator, "reduce")) {
    // @ts-ignore
    return generator.reduce(reducer, ...rest);
  }
  let acc: unknown;
  if (rest.length) {
    acc = rest[0];
  } else {
    const first = generator.next();
    if (first.done) {
      throw new TypeError(
        `Yielded.reduce requires an initial value or an iterator that is not done.`,
      );
    }
    acc = first.value;
  }
  let index = 0;
  for (const next of generator) {
    acc = reducer(acc, next, index++);
  }
  return acc;
}

export async function reduceAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  reducer: (acc: T, next: T, index: number) => IMaybeAsync<T>,
): Promise<T>;
export async function reduceAsync<T, TOut>(
  generator: IYieldedAsyncGenerator<T>,
  reducer: (acc: TOut, next: T, index: number) => IMaybeAsync<TOut>,
  initialValue: IMaybeAsync<TOut>,
): Promise<TOut>;
export async function reduceAsync(
  generator: IYieldedAsyncGenerator,
  reducer: (acc: unknown, next: unknown, index: number) => unknown,
  ...rest: [unknown] | []
): Promise<unknown> {
  let acc: Promise<unknown>;
  if (rest.length) {
    acc = Promise.resolve(rest[0]);
  } else {
    const first = await generator.next();
    if (first.done) {
      throw new TypeError(
        `AsyncYielded.reduce requires an initial value or an iterator that is not done.`,
      );
    }
    acc = Promise.resolve(first.value);
  }
  let index = 0;
  for await (const next of generator) {
    acc = acc.then((acc) => reducer(acc, next, index++));
  }
  return acc;
}

export function reduceParallel<T>(
  reducer: (acc: T, next: T, index: number) => IMaybeAsync<T>,
): IParallelResolverSubConfig<T, T>;
export function reduceParallel<T, TOut>(
  reducer: (acc: TOut, next: T, index: number) => IMaybeAsync<TOut>,
  initialValue: IMaybeAsync<TOut>,
): IParallelResolverSubConfig<T, TOut>;
export function reduceParallel(
  reducer: (acc: unknown, next: unknown, index: number) => unknown,
  ...rest: [unknown] | []
): IParallelResolverSubConfig<unknown, unknown> {
  let acc: unknown | symbol = !!rest.length ? rest[0]! : getEmptySlot();
  let index = 0;
  return {
    name: "reduce",
    onNext: throttle(1, async function onNext(value) {
      if (isEmptySlot(acc)) {
        acc = value;
        return;
      }
      acc = await reducer(await acc, value, index++);
    }),
    async onDone(resolve) {
      if (!isEmptySlot(acc)) {
        return resolve(acc);
      }
      throw new TypeError(
        `ParallelYielded.reduce requires an initial value or an iterator that is not done.`,
      );
    },
  };
}
