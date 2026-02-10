import type { IMaybeAsync, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedSumBy<T, TFlow extends IYieldedFlow> {
  /**
   * Applies the provided selector to each item produced by the generator
   * and returns the sum of the resulting numeric values.
   *
   * Iterates through all items and accumulates the total by adding the
   * number returned by `fn` for each item. If the generator produces no
   * items, `0` is returned.
   * @example
   * Yielded.from([1,2,3,4,5])
   * .sumBy(n => n) satisfies number | undefined // 15
   *
   * @example
   * Yielded.from<number>([])
   * .sumBy(n => n) satisfies number | undefined // 0
   */
  sumBy(fn: (next: T) => number): IResolverReturn<number, TFlow>;
}

export function sumBySync<T>(
  generator: IYieldedSyncGenerator<T>,
  mapper: (next: T) => number,
): number {
  return generator.reduce((acc, next) => mapper(next) + acc, 0);
}

export async function sumByAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  mapper: (next: T) => IMaybeAsync<number>,
): Promise<number> {
  let acc = 0;
  for await (const next of generator) {
    acc += await mapper(next);
  }
  return acc;
}

export function sumByParallel<T>(
  mapper: (next: T) => IMaybeAsync<number>,
): IParallelResolverSubConfig<T, number> {
  let acc = 0;
  return {
    name: "sumBy",
    async onNext(value) {
      const numb = await mapper(value);
      acc += numb;
    },
    onDone(resolve) {
      resolve(acc);
    },
  };
}
