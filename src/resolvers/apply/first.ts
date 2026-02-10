import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";
import { createGeneratorEmptyMsg } from "./utils/createGeneratorEmptyMsg.ts";

export interface IYieldedFirst<T, TFlow extends IYieldedFlow> {
  /**
   * Returns the first item produced by the generator.
   *
   * Iteration stops as soon as the first item is produced, so the generator
   * is **not fully consumed**.
   * If the generator produces no items, `undefined` is returned. */
  first(): IResolverReturn<T, TFlow>;
  first<TDefault>(defaultValue: TDefault): IResolverReturn<T | TDefault, TFlow>;
}

export function firstSync<T, TDefault>(
  generator: IYieldedSyncGenerator<T>,
  defaultValue: TDefault,
): T | TDefault;
export function firstSync<T>(generator: IYieldedSyncGenerator<T>): T;
export function firstSync(
  generator: IYieldedSyncGenerator,
  ...rest: unknown[]
): unknown {
  const next = generator.next();
  if (next.done) {
    if (rest.length) return rest[0];
    throw new TypeError(createGeneratorEmptyMsg("Yielded", "first"));
  }
  return next.value;
}

export async function firstAsync<T, TDefault>(
  generator: IYieldedAsyncGenerator<T>,
  defaultValue: TDefault,
): Promise<T | TDefault>;
export async function firstAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
): Promise<T>;
export async function firstAsync(
  generator: IYieldedAsyncGenerator,
  ...rest: unknown[]
): Promise<unknown> {
  const next = await generator.next();
  if (next.done) {
    if (rest.length) return rest[0];
    throw new TypeError(createGeneratorEmptyMsg("AsyncYielded", "first"));
  }
  return next.value;
}

export function firstParallel<T>(): IParallelResolverSubConfig<T, T>;
export function firstParallel<T, TDefault>(
  defaultValue: TDefault,
): IParallelResolverSubConfig<T, T | TDefault>;
export function firstParallel(
  ...rest: unknown[]
): IParallelResolverSubConfig<unknown, unknown> {
  return {
    name: "first",
    onNext(value, resolve) {
      resolve(value);
    },
    onDone(resolve) {
      if (rest.length) return resolve(rest[0]);
      throw new TypeError(createGeneratorEmptyMsg("ParallelYielded", "first"));
    },
  };
}
