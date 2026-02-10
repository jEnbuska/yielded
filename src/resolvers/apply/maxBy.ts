import type { IMaybeAsync, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import type { ICallbackReturn } from "../../generators/types.ts";
import {
  type IParallelResolverName,
  type IParallelResolverSubConfig,
} from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn, ISharedYieldedResolver } from "../types.ts";
import { createGeneratorEmptyMsg } from "./utils/createGeneratorEmptyMsg.ts";
import { getEmptySlot, isEmptySlot } from "./utils/emptySlot.ts";
import { memoize } from "./utils/memoize.ts";

export interface IYieldedMaxBy<T, TFlow extends IYieldedFlow> {
  /**
   * Returns the item produced by the generator for which the selector
   * returns the **the highest numeric value**.
   *
   * Iterates through all items, applying the `selector` to each one and
   * keeping the item with the maximum returned number. If the generator
   * produces no items, `undefined` is returned.
   *
   * @example
   * ```ts
   * Yielded.from([2,1,3,4])
   *  .maxBy(n => n) satisfies number | undefined // 4
   * ```
   * ```ts
   * Yielded.from<number>([])
   *  .maxBy(n => n) satisfies number // throw TypeError
   *  ```
   * ```ts
   * Yielded.from<number>([])
   *  .maxBy(n => n, undefined) satisfies number | undefined // undefined
   *  ```
   */
  maxBy(
    selector: (next: T) => ICallbackReturn<number, TFlow>,
  ): IResolverReturn<T, TFlow>;
  maxBy<TDefault>(
    selector: (next: T) => ICallbackReturn<number, TFlow>,
    defaultValue: TDefault,
  ): IResolverReturn<T | TDefault, TFlow>;
}

export function maxBySync<T, TDefault>(
  generator: IYieldedSyncGenerator<T>,
  callback: (next: T, index: number) => number,
  defaultValue: TDefault,
): T | TDefault;
export function maxBySync<T>(
  generator: IYieldedSyncGenerator<T>,
  callback: (next: T, index: number) => number,
): T;
export function maxBySync(
  generator: IYieldedSyncGenerator,
  callback: (next: unknown, index: number) => number,
  ...rest: unknown[]
): unknown {
  return handleMaxBySync("maxBy", generator, callback, rest);
}

export function handleMaxBySync(
  method: keyof ISharedYieldedResolver<any, "sync">,
  generator: IYieldedSyncGenerator,
  callback: (next: unknown, index: number) => number,
  rest: unknown[],
): unknown {
  const next = generator.next();
  let index = 0;
  if (next.done) {
    if (rest.length) return rest[0];
    throw new TypeError(createGeneratorEmptyMsg("Yielded", method));
  }
  let current = next.value;
  let currentMax = callback(current, index++);
  for (const next of generator) {
    const value = callback(next, index++);
    if (value > currentMax) {
      current = next;
      currentMax = value;
    }
  }
  return current;
}

export async function maxByAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  callback: (next: T, index: number) => IMaybeAsync<number>,
): Promise<T>;
export async function maxByAsync<T, TDefault>(
  generator: IYieldedAsyncGenerator<T>,
  callback: (next: T, index: number) => IMaybeAsync<number>,
  defaultValue: TDefault,
): Promise<T | TDefault>;
export async function maxByAsync(
  generator: IYieldedAsyncGenerator,
  callback: (next: unknown, index: number) => IMaybeAsync<number>,
  ...rest: unknown[]
): Promise<unknown> {
  return handleMaxByAsync("maxBy", generator, callback, rest);
}

export async function handleMaxByAsync(
  method: keyof ISharedYieldedResolver<any, "async">,
  generator: IYieldedAsyncGenerator,
  callback: (next: unknown, index: number) => IMaybeAsync<number>,
  rest: unknown[],
): Promise<unknown> {
  const next = await generator.next();
  if (next.done) {
    if (rest.length) return rest[0];
    throw new TypeError(createGeneratorEmptyMsg("AsyncYielded", method));
  }
  let index = 0;
  let acc = next.value;
  let max = await callback(acc, index++);
  for await (const next of generator) {
    const numb = await callback(next, index++);
    if (numb > max) {
      acc = next;
      max = numb;
    }
  }
  return acc;
}

export function maxByParallel<T>(
  callback: (next: T, index: number) => IMaybeAsync<number>,
): IParallelResolverSubConfig<T, T>;
export function maxByParallel<T, TDefault>(
  callback: (next: T, index: number) => IMaybeAsync<number>,
  defaultValue: TDefault,
): IParallelResolverSubConfig<T, T | TDefault>;
export function maxByParallel(
  callback: (next: unknown, index: number) => IMaybeAsync<number>,
  ...rest: unknown[]
): IParallelResolverSubConfig<unknown, unknown> {
  return handleMaxByParallel("maxBy", callback, rest);
}

export function handleMaxByParallel(
  name: IParallelResolverName,
  callback: (next: unknown, index: number) => IMaybeAsync<number>,
  rest: unknown[],
): IParallelResolverSubConfig<unknown, unknown> {
  let acc: { item: unknown | symbol; value: number | symbol } = {
    item: getEmptySlot(),
    value: getEmptySlot(),
  };
  const getAccValue = memoize(callback);
  let index = 0;
  return {
    name,
    async onNext(value) {
      if (isEmptySlot(acc.item)) {
        acc.item = value;
        return;
      }
      if (isEmptySlot(acc.value)) {
        acc.value = await getAccValue(acc.item, 0);
        index++;
      }
      const numb = await callback(value, index++);
      if (numb > acc.value) {
        acc = { value: numb, item: value };
      }
    },
    onDone(resolve) {
      if (!isEmptySlot(acc.item)) return resolve(acc.item);
      if (rest.length) return resolve(rest[0]);
      throw new TypeError(createGeneratorEmptyMsg("ParallelYielded", name));
    },
  };
}
