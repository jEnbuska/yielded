import type { IMaybeAsync, IYieldedFlow } from "../../general/types.ts";
import { throttle } from "../../general/utils/parallel.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import type { ICallbackReturn } from "../../generators/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedToSorted<T, TFlow extends IYieldedFlow> {
  /**
   * Returns the items produced by the generator in sorted order as a new array.
   *
   * Items are inserted into the sorted result incrementally as they are
   * produced by the generator. Sorting happens **one item at a time** using
   * the provided comparison function, rather than collecting all items first
   * and sorting afterward.
   *
   * The generator is still fully consumed before the final array is returned.
   *
   * The `compare` function follows the same contract as
   * `Array.prototype.sort`:
   * - returns a negative number if `previous` should come before `next`
   * - returns a positive number if `previous` should come after `next`
   * - returns `0` to keep their relative order
   * */
  toSorted(
    compare?: (previous: T, next: T) => ICallbackReturn<number, TFlow>,
  ): IResolverReturn<T[], TFlow>;
}

function createIndexFinder<T>(
  arr: T[],
  comparator: (a: T, b: T) => number = defaultCompare,
) {
  return function findIndex(next: T, low = 0, high = arr.length - 1) {
    if (low > high) {
      return low;
    }
    const mid = Math.floor((low + high) / 2);
    const diff = comparator(next, arr[mid]!);
    if (diff < 0) {
      return findIndex(next, low, mid - 1);
    }
    return findIndex(next, mid + 1, high);
  };
}

export function createIndexFinderAsync<T>(
  arr: T[],
  comparator: (a: T, b: T) => IMaybeAsync<number> = defaultCompare,
) {
  return async function findIndexAsync(
    next: T,
    low = 0,
    high = arr.length - 1,
  ) {
    if (low > high) {
      return low;
    }
    const mid = Math.floor((low + high) / 2);
    const diff = await comparator(next, arr[mid]!);
    if (diff < 0) {
      return findIndexAsync(next, low, mid - 1);
    }
    return findIndexAsync(next, mid + 1, high);
  };
}

export function toSortedSync<T>(
  generator: IYieldedSyncGenerator<T>,
  compareFn?: (a: T, b: T) => number,
): T[] {
  const arr: T[] = [];
  const findIndex = createIndexFinder(arr, compareFn);
  for (const next of generator) {
    arr.splice(findIndex(next), 0, next);
  }
  return arr;
}

export async function toSortedAsync<T>(
  generator: IYieldedAsyncGenerator<T>,
  compareFn?: (a: T, b: T) => IMaybeAsync<number>,
): Promise<T[]> {
  const arr: T[] = [];
  const findIndex = createIndexFinderAsync(arr, compareFn);
  let pending: Promise<unknown> = Promise.resolve();
  for await (const next of generator) {
    pending = pending.then(() =>
      findIndex(next).then((index) => arr.splice(index, 0, next)),
    );
  }
  await pending;
  return arr;
}

const defaultCompare = (a: unknown, b: unknown) => {
  const sa = String(a);
  const sb = String(b);
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
};
export function toSortedParallel<T>(
  compareFn?: (a: T, b: T) => IMaybeAsync<number>,
): IParallelResolverSubConfig<T, T[]> {
  const arr: T[] = [];
  const findIndex = createIndexFinderAsync(arr, compareFn);
  const handleSort = throttle(1, async function handleSort(value: T) {
    const index = await findIndex(value);
    arr.splice(index, 0, value);
  });
  return {
    name: "toSorted",
    async onNext(value) {
      await handleSort(value);
    },
    async onDone(resolve) {
      resolve(arr);
    },
  };
}
