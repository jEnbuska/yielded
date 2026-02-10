import type { IMaybeAsync, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import type { ICallbackReturn } from "../../generators/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";
import {
  handleMaxByAsync,
  handleMaxByParallel,
  handleMaxBySync,
} from "./maxBy.ts";

export interface IYieldedMinBy<T, TFlow extends IYieldedFlow> {
  /**
   * Returns the item produced by the generator for which the selector
   * returns the **the lowest numeric value**.
   *
   * Iterates through all items, applying the `selector` to each one and
   * keeping the item with the minimum returned number. If the generator
   * produces no items, `undefined` is returned.
   *
   * @example
   * ```ts
   * Yielded.from([2,1,3,4])
   *  .minBy(n => n) satisfies number // 1
   * ```
   * ```ts
   * Yielded.from<number>([])
   *  .minBy(n => n) satisfies number // throw TypeError
   *  ```
   * ```ts
   * Yielded.from<number>([])
   *  .minBy(n => n, undefined) satisfies number | undefined // undefined
   *  ```
   */
  minBy(
    selector: (next: T, index: number) => ICallbackReturn<number, TFlow>,
  ): IResolverReturn<T, TFlow>;
  minBy<TDefault>(
    selector: (next: T, index: number) => ICallbackReturn<number, TFlow>,
    defaultValue: TDefault,
  ): IResolverReturn<T | TDefault, TFlow>;
}

export function minBySync<T>(
  generator: IYieldedSyncGenerator<T>,
  callback: (next: T, index: number) => number,
): T;
export function minBySync<T, TDefault>(
  generator: IYieldedSyncGenerator<T>,
  callback: (next: T, index: number) => number,
  defaultValue: TDefault,
): T | TDefault;
export function minBySync(
  generator: IYieldedSyncGenerator,
  callback: (next: unknown, index: number) => number,
  ...rest: unknown[]
): unknown {
  return handleMaxBySync(
    "minBy",
    generator,
    (...args) => -callback(...args),
    rest,
  );
}

export async function minByAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  callback: (next: T, index: number) => IMaybeAsync<number>,
): Promise<T>;
export async function minByAsync<T, TDefault>(
  generator: IYieldedAsyncGenerator<T>,
  callback: (next: T, index: number) => IMaybeAsync<number>,
  defaultValue: TDefault,
): Promise<T | TDefault>;
export async function minByAsync(
  generator: IYieldedAsyncGenerator,
  callback: (next: unknown, index: number) => IMaybeAsync<number>,
  ...rest: unknown[]
): Promise<unknown> {
  return handleMaxByAsync(
    "minBy",
    generator,
    async (...args) => {
      const numb = await callback(...args);
      return -numb;
    },
    rest,
  );
}

export function minByParallel<T>(
  callback: (next: T, index: number) => IMaybeAsync<number>,
): IParallelResolverSubConfig<T, T>;
export function minByParallel<T, TDefault>(
  callback: (next: T, index: number) => IMaybeAsync<number>,
  defaultValue: TDefault,
): IParallelResolverSubConfig<T, T | TDefault>;
export function minByParallel(
  callback: (next: unknown, index: number) => IMaybeAsync<number>,
  ...rest: unknown[]
): IParallelResolverSubConfig<unknown, unknown> {
  return handleMaxByParallel(
    "minBy",
    async (...args) => {
      const numb = await callback(...args);
      return -numb;
    },
    rest,
  );
}
