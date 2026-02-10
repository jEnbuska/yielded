import type { IYieldedFlow } from "../../general/types.ts";
import { hasNative } from "../../general/utils/hasNative.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedSome<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/some}
   *
   * Determines whether the provided predicate returns a truthy value
   * for **any** item produced by the generator.
   *
   * Iterates through the generator and invokes `predicate` for each item
   * until it returns a truthy value (or a resolved truthy value for async
   * generators). Iteration stops immediately once a match is found.
   *
   * Returns `false` if the generator produces no items or if the predicate
   * never evaluates to a truthy value.
   *
   * ```ts
   * Yielded.from([1,2,3,4])
   *  .some(n => n > 2) satisfies boolean // true
   *  ```
   * ```ts
   * Yielded.from([1,2,3,4])
   *  .some(n => n > 5) satisfies boolean // false
   *  ```
   * ```ts
   * Yielded.from([])
   *  .some(Boolean) satisfies boolean // false
   *  ```
   */
  some(
    predicate: (next: T, index: number) => unknown,
  ): IResolverReturn<boolean, TFlow>;
}

function someSync<T>(
  generator: IYieldedSyncGenerator<T>,
  predicate: (value: T, index: number) => unknown,
): boolean {
  if (hasNative(generator, "some")) {
    return generator.some(predicate);
  }
  let index = 0;
  for (const next of generator) {
    // Do not perform predicates, since we might want to stop at any point
    if (predicate(next, index++)) return true;
  }
  return false;
}

export default someSync;

export async function someAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  predicate: (value: T, index: number) => unknown,
): Promise<boolean> {
  let index = 0;
  for await (const next of generator) {
    // Do not perform predicates, since we might want to stop at any point
    if (await predicate(next, index++)) return true;
  }
  return false;
}

export function someParallel<T>(
  predicate: (value: T, index: number) => unknown,
): IParallelResolverSubConfig<T, boolean> {
  let index = 0;
  return {
    name: "some",
    async onNext(value, resolve) {
      const match = await predicate(value, index++);
      if (match) resolve(true);
    },
    onDone(resolve) {
      resolve(false);
    },
  };
}
