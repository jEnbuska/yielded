import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedConsume<TFlow extends IYieldedFlow> {
  /**
   *  Fully consumes the generator without producing a result.
   *
   *  Iterates through all items, effectively discarding them. Useful when
   *  you want to trigger all side effects of the generator or ensure that
   *  all asynchronous operations are completed.
   * @example
   * ```ts
   * Yielded.from([1, 2, 3])
   *   .tap(n => console.log(n)) // logs 1, 2, 3
   *   .consume() satisfies void;
   *  */
  consume(): IResolverReturn<void, TFlow>;
}

export function consumeSync(generator: IYieldedSyncGenerator) {
  for (const _ of generator) {
    /* Do nothing */
  }
}

export async function consumeAsync(generator: IYieldedAsyncGenerator) {
  for await (const _ of generator) {
    /* Do nothing */
  }
}

export function consumeParallel(): IParallelResolverSubConfig<unknown, void> {
  return {
    name: "consume",
    onDone(resolve) {
      resolve();
    },
  };
}
