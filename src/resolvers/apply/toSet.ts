import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedToSet<T, TFlow extends IYieldedFlow> {
  toSet(): IResolverReturn<Set<T>, TFlow>;
}

export function toSetSync<T>(generator: IYieldedSyncGenerator<T>): Set<T> {
  return new Set(generator);
}
export async function toSetAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
): Promise<Set<T>> {
  const set = new Set<T>();
  for await (const next of generator) set.add(next);
  return set;
}

export function toSetParallel<T>(): IParallelResolverSubConfig<T, Set<T>> {
  const set = new Set<T>();
  return {
    name: "toSet",
    onNext(value) {
      set.add(value);
    },
    onDone(resolve) {
      resolve(set);
    },
  };
}
