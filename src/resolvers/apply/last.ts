import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";
import { createGeneratorEmptyMsg } from "./utils/createGeneratorEmptyMsg.ts";
import { getEmptySlot, isEmptySlot } from "./utils/emptySlot.ts";

export interface IYieldedLast<T, TFlow extends IYieldedFlow> {
  /**
   * Returns the last item produced by the generator.
   *
   * Iterates through all items in the generator and returns the final item.
   * The generator is fully consumed during this operation. If the generator
   * produces no items, `undefined` is returned.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3])
   *   .last() satisfies number | undefined // 3
   * ```
   * ```ts
   * Yielded.from<number>([])
   *   .last() satisfies number | undefined // undefined
   * ```
   */
  last(): IResolverReturn<T | undefined, TFlow>;
  last<TDefault>(defaultValue: TDefault): IResolverReturn<T | TDefault, TFlow>;
}

export function lastSync<T, TDefault>(
  generator: IYieldedSyncGenerator<T>,
  defaultValue: TDefault,
): T | TDefault;
export function lastSync<T>(generator: IYieldedSyncGenerator<T>): T;
export function lastSync(
  generator: IYieldedSyncGenerator,
  ...rest: unknown[]
): unknown {
  const next = generator.next();
  if (next.done) {
    if (rest.length) return rest[0];
    throw new TypeError(createGeneratorEmptyMsg("Yielded", "last"));
  }
  let last = next.value;
  for (const next of generator) last = next;
  return last;
}

export async function lastAsync<T, TDefault>(
  generator: IYieldedAsyncGenerator<T>,
  defaultValue: TDefault,
): Promise<T | TDefault>;
export async function lastAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
): Promise<T>;
export async function lastAsync(
  generator: IYieldedAsyncGenerator,
  ...rest: unknown[]
): Promise<unknown> {
  const next = await generator.next();
  if (next.done) {
    if (rest.length) return rest[0];
    throw new TypeError(createGeneratorEmptyMsg("AsyncYielded", "last"));
  }
  let last = next.value;
  for await (const next of generator) last = next;
  return last;
}

export function lastParallel<T>(): IParallelResolverSubConfig<T, T>;
export function lastParallel<T, TDefault>(
  defaultValue: TDefault,
): IParallelResolverSubConfig<T, T | TDefault>;
export function lastParallel(
  ...rest: unknown[]
): IParallelResolverSubConfig<unknown, unknown> {
  let last: unknown = rest.length ? rest[0] : getEmptySlot();
  return {
    name: "last",
    onNext(value) {
      last = value;
    },
    onDone(resolve) {
      if (!isEmptySlot(last)) return resolve(last);
      throw new TypeError(createGeneratorEmptyMsg("ParallelYielded", "last"));
    },
  };
}
