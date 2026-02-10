import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedCount<TFlow extends IYieldedFlow> {
  /**
   * Counts the number of items produced by the generator.
   *
   * Iterates through all items in the generator and returns the total count
   * as a number.
   *
   * @example
   * ```ts
   * Yielded.from([10, 20, 100]).count() satisfies number // 3
   * ```
   * ```ts
   * Yielded.from([]).count() satisfies number // 0
   * ```
   */
  count(): IResolverReturn<number, TFlow>;
}

function counter(_acc: unknown, _next: unknown, index: number) {
  return index + 1;
}
export function countSync(generator: IYieldedSyncGenerator<any>): number {
  return generator.reduce(counter, 0);
}

export async function countAsync(
  generator: IYieldedAsyncGenerator,
): Promise<number> {
  let acc = 0;
  for await (const _ of generator) {
    acc++;
  }
  return acc;
}

export function countParallel(): IParallelResolverSubConfig<unknown, number> {
  let count = 0;
  return {
    name: "count",
    async onNext() {
      count++;
    },
    onDone(resolve) {
      resolve(count);
    },
  };
}
