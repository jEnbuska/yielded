import type { INextYielded, IYieldedFlow } from "../../general/types.ts";
import { hasNative } from "../../general/utils/hasNative.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { ICallbackReturn, IYieldedGenerator } from "../types.ts";

export interface IYieldedFilter<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/filter}
   *
   * Filters items produced by the generator using the provided predicate
   * and yields only the items that pass the predicate to the next operation.
   *
   * **Overloads:**
   *
   * @example
   * ```ts
   * // Type-narrowing predicate
   * Yielded.from([1, 2, 3, "A"])
   *   .filter((n): n is number => typeof n === "number")
   *   .toArray() satisfies number[] // [1, 2, 3]
   * ```
   * ```ts
   * // General predicate
   * Yielded.from([1, 2, 3])
   *   .filter(n => n % 2)
   *   .toArray() satisfies number[] // [1, 3]
   * ```
   */

  filter<TOut extends T>(
    predicate: (next: T, index: number) => next is TOut,
  ): INextYielded<TOut, TFlow>;
  filter(
    predicate: (next: T, index: number) => ICallbackReturn<unknown, TFlow>,
  ): INextYielded<T, TFlow>;
}

export function filterSync<T, TOut extends T = T>(
  generator: IYieldedSyncGenerator<T>,
  predicate: (next: T, index: number) => next is TOut,
): IYieldedSyncGenerator<TOut>;
export function filterSync<T>(
  generator: IYieldedSyncGenerator<T>,
  predicate: (next: T, index: number) => unknown,
): IYieldedSyncGenerator<T>;
export function* filterSync(
  generator: IYieldedSyncGenerator,
  predicate: (next: unknown, index: number) => unknown,
): IYieldedSyncGenerator {
  if (hasNative(generator, "filter")) {
    return yield* generator.filter(predicate);
  }
  let index = 0;
  for (const next of generator) {
    if (predicate(next, index++)) yield next;
  }
}

export function filterAsync<T, TOut extends T = T>(
  generator: IYieldedAsyncGenerator<T>,
  predicate: (next: T, index: number) => next is TOut,
): IYieldedAsyncGenerator<TOut>;
export function filterAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  predicate: (next: T, index: number) => unknown,
): IYieldedAsyncGenerator<T>;
export async function* filterAsync(
  generator: IYieldedAsyncGenerator,
  predicate: (next: unknown, index: number) => unknown,
): IYieldedAsyncGenerator {
  let index = 0;
  for await (const next of generator) {
    if (await predicate(next, index++)) yield next;
  }
}

export function filterParallel<T, TOut extends T = T>(
  predicate: (next: T, index: number) => next is TOut,
): IParallelGeneratorSubConfig<TOut>;
export function filterParallel<T>(
  predicate: (next: T, index: number) => unknown,
): IParallelGeneratorSubConfig<T>;
export function filterParallel(
  predicate: (next: unknown, index: number) => unknown,
): IParallelGeneratorSubConfig<unknown, unknown> {
  let index = 0;
  return {
    name: "filter",
    async onNext(next) {
      const match = await predicate(next, index++);
      if (!match) return;
      return [next];
    },
  };
}
