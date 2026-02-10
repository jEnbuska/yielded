import type {
  IMaybeAsync,
  INextYielded,
  IYieldedFlow,
} from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import type { ICallbackReturn } from "../types.ts";

export interface IYieldedTakeWhile<T, TFlow extends IYieldedFlow> {
  /**
   * Yields items produced by the generator **while the predicate returns `true`**
   * to the next operation in the pipeline.
   *
   * Once the predicate returns `false` for the first time, the generator
   * **stops producing further items** and all upstream work halts. Any items
   * already yielded continue downstream.
   *
   * @example
   * ```ts
   * Yielded.from([1, 2, 3, 4])
   *   .takeWhile(n => n < 3)
   *   .toArray() satisfies number[] // [1, 2]
   * ```
   * ```ts
   * Yielded.from([1, 2, 3, 4])
   *   .takeWhile(n => n < 0)
   *   .toArray() satisfies number[] // []
   * ```
   */
  takeWhile(
    fn: (next: T) => ICallbackReturn<boolean, TFlow>,
  ): INextYielded<T, TFlow>;
}

export function* takeWhileSync<T>(
  generator: IYieldedSyncGenerator<T>,
  predicate: (next: T) => boolean,
): IYieldedSyncGenerator<T> {
  for (const next of generator) {
    if (!predicate(next)) return;
    yield next;
  }
}

export async function* takeWhileAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  predicate: (next: T) => IMaybeAsync<boolean>,
): IYieldedAsyncGenerator<T> {
  for await (const next of generator) {
    if (!(await predicate(next))) return;
    yield next;
  }
}

export function takeWhileParallel<T>(
  predicate: (next: T) => IMaybeAsync<boolean>,
): IParallelGeneratorSubConfig<T> {
  return {
    name: "takeWhile",
    async onNext(next) {
      if (await predicate(next)) return [next];
      return "STOP";
    },
  };
}
