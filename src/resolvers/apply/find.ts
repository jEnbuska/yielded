import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { ICallbackReturn } from "../../generators/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedFind<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/find}
   *
   * Returns the first item in the generator that satisfies the provided predicate.
   *
   * Iterates through the generator until `predicate` returns a truthy value
   * (or a resolved truthy value for async generators). If a matching item is
   * found, it is returned; otherwise, `undefined` is returned.
   *
   * There are two overloads:
   * 1. **Type-guard predicate** – narrows the returned type to `TOut` or `undefined`.
   * 2. **Regular predicate** – returns the original type `T` or `undefined`.
   * @example```ts
   * // Regular
   * Yielded.from([1,2,3,4]).find(n => n > 2) satisfies number | undefined // 3
   * ```
   * ```ts
   * // Type-guard
   * Yielded.from([1,2,3]).find((n): n is 1 => n === 1) satisfies 1 | undefined // 1;
   * ```
   */
  find<TOut extends T>(
    predicate: (next: T) => next is TOut,
  ): IResolverReturn<TOut | undefined, TFlow>;
  find(
    predicate: (next: T) => ICallbackReturn<unknown, TFlow>,
  ): IResolverReturn<T | undefined, TFlow>;
}

export function findAsync<T, TOut extends T = T>(
  generator: IYieldedAsyncGenerator<T>,
  predicate: (value: T, index: number) => value is TOut,
): Promise<TOut | undefined>;
export function findAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  predicate: (value: T, index: number) => unknown,
): Promise<T | undefined>;
export async function findAsync(
  generator: IYieldedAsyncGenerator,
  predicate: (value: unknown, index: number) => unknown,
): Promise<unknown | undefined> {
  const index = 0;
  for await (const next of generator) {
    // Do not perform predicates, since we might want to stop at any point
    if (await predicate(next, index)) return next;
  }
}

export function findParallel<T, TOut extends T = T>(
  predicate: (value: T, index: number) => value is TOut,
): IParallelResolverSubConfig<T, TOut | undefined>;
export function findParallel<T>(
  predicate: (value: T, index: number) => unknown,
): IParallelResolverSubConfig<T, T | undefined>;
export function findParallel(
  predicate: (value: unknown, index: number) => unknown,
): IParallelResolverSubConfig<unknown, unknown> {
  let index = 0;
  return {
    name: "find",
    async onNext(value, resolve) {
      const match = await predicate(value, index++);
      if (!match) return;
      resolve(value);
    },
    onDone(resolve) {
      resolve(undefined);
    },
  };
}
