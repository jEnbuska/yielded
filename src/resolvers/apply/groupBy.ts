import type { IMaybeAsync, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import type { ICallbackReturn } from "../../generators/types.ts";
import { type IParallelResolverSubConfig } from "../parallel/ParallelGeneratorResolver.ts";
import type { IResolverReturn } from "../types.ts";

export interface IYieldedGroupBy<T, TFlow extends IYieldedFlow> {
  /**
   * Groups items produced by the generator using a key derived from each item.
   *
   * Each item is assigned to a group based on the value returned by
   * `keySelector`. The result is an object whose keys are group identifiers
   * and whose values are arrays of items belonging to each group.
   *
   * When the optional `groups` array is provided, the returned object is
   * guaranteed to contain **at least** those group keys. Groups that are
   * listed but not produced by the input will be present with an empty array.
   *
   * Groups that are produced by `keySelector` but not listed in `groups`
   * may still appear in the result, but are typed as optional.
   *
   * @example
   * ```ts
   * Yielded.from([1,2,3,4,5])
   *  .groupBy(n => n % 2 ? 'odd' : 'even') satisfies Partial<Record<'odd' | 'even', number[]>>
   *    // {even: [2,4], odd: [1,3,5]}
   *  ```
   * ```ts
   * Yielded.from([1,2,3,4,5])
   *  .groupBy(
   *    n => n % 2 ? 'odd' : 'even',
   *    ['odd', 'other']
   *  ) satisfies Record<'odd' | 'even' | 'other', number[]> & Partial<Record<'even', number[]>>
   *    // {even: [2,4], odd: [1,3,5], other:[]}
   *    ```
   */
  groupBy<TKey extends PropertyKey, const TGroups extends PropertyKey>(
    keySelector: (next: T) => ICallbackReturn<TKey, TFlow>,
    groups: TGroups[] | readonly TGroups[],
  ): IResolverReturn<
    Record<TGroups, T[]> & Partial<Record<Exclude<TKey, TGroups>, T[]>>,
    TFlow
  >;
  groupBy<TKey extends PropertyKey>(
    keySelector: (next: T) => ICallbackReturn<TKey, TFlow>,
    groups?: undefined,
  ): IResolverReturn<Partial<Record<TKey, T[]>>, TFlow>;
}

function createInitialGroups(
  groups: undefined | PropertyKey[] = [],
): Partial<Record<PropertyKey, any>> {
  return Object.fromEntries(groups.map((key) => [key, [] as any[]]));
}

export function groupBySync<T, TKey extends PropertyKey>(
  generator: IYieldedSyncGenerator<T>,
  keySelector: (next: T) => TKey,
  groups?: undefined,
): Partial<Record<TKey, T[]>>;
export function groupBySync<
  T,
  TKey extends PropertyKey,
  TGroups extends PropertyKey,
>(
  generator: IYieldedSyncGenerator<T>,
  keySelector: (next: T) => TKey,
  groups: TGroups[],
): Record<TGroups, T[]> & Partial<Record<Exclude<TKey, TGroups>, T[]>>;
export function groupBySync(
  generator: IYieldedSyncGenerator,
  keySelector: (next: unknown) => PropertyKey,
  groups: undefined | PropertyKey[],
): Partial<Record<PropertyKey, unknown[]>> {
  const record = createInitialGroups(groups);
  for (const next of generator) {
    const key = keySelector(next);
    if (!(key in record)) record[key] = [];
    record[key].push(next);
  }
  return record;
}

export async function groupByAsync(
  generator: IYieldedAsyncGenerator,
  keySelector: (next: unknown) => IMaybeAsync<PropertyKey>,
  groups: PropertyKey[] = [],
): Promise<unknown> {
  const record = createInitialGroups(groups);
  for await (const next of generator) {
    const key = await keySelector(next);
    if (!(key in record)) record[key] = [];
    record[key].push(next);
  }
  return record;
}

export function groupByParallel(
  keySelector: (next: unknown) => IMaybeAsync<PropertyKey>,
  groups: PropertyKey[] = [],
): IParallelResolverSubConfig<unknown, unknown> {
  const record = createInitialGroups(groups);
  return {
    name: "groupBy",
    async onNext(value) {
      const key = await keySelector(value);
      if (!(key in record)) {
        record[key] = [];
      }
      record[key].push(value);
    },
    onDone(resolve) {
      resolve(record);
    },
  };
}
