import type { IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedToArray<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/toArray}
   *
   * Collects all items produced by the generator and returns them
   * as a new array.
   *
   * The generator is fully consumed before the array is returned.
   * */
  toArray(): IResolverReturn<T[], TFlow>;
}

export async function toArrayAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
): Promise<T[]> {
  const arr: T[] = [];
  for await (const next of generator) {
    arr.push(next);
  }
  return arr;
}

export function toArrayParallel<T>(): IParallelResolverSubConfig<T, T[]> {
  const arr: T[] = [];
  return {
    name: "toArray",
    onNext(value) {
      arr.push(value);
    },
    onDone(resolve) {
      resolve(arr);
    },
  };
}
