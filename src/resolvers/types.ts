import type { IYieldedFlow } from "../general/types.ts";
import type { IYieldedConsume } from "./apply/consume.ts";
import type { IYieldedCount } from "./apply/count.ts";
import type { IYieldedEvery } from "./apply/every.ts";
import type { IYieldedFind } from "./apply/find.ts";
import type { IYieldedFirst } from "./apply/first.ts";
import type { IYieldedForEach } from "./apply/forEach.ts";
import type { IYieldedGroupBy } from "./apply/groupBy.ts";
import type { IYieldedLast } from "./apply/last.ts";
import type { IYieldedMaxBy } from "./apply/maxBy.ts";
import type { IYieldedMinBy } from "./apply/minBy.ts";
import type { IYieldedReduce } from "./apply/reduce.ts";
import type { IYieldedSome } from "./apply/some.ts";
import type { IYieldedSumBy } from "./apply/sumBy.ts";
import type { IYieldedToArray } from "./apply/toArray.ts";
import type { IYieldedToReversed } from "./apply/toReversed.ts";
import type { IYieldedToSet } from "./apply/toSet.ts";
import type { IYieldedToSorted } from "./apply/toSorted.ts";

export interface ISharedYieldedResolver<T, TFlow extends IYieldedFlow>
  extends
    IYieldedReduce<T, TFlow>, //
    IYieldedFind<T, TFlow>,
    IYieldedMaxBy<T, TFlow>,
    IYieldedSome<T, TFlow>,
    IYieldedEvery<T, TFlow>,
    IYieldedMinBy<T, TFlow>,
    IYieldedGroupBy<T, TFlow>, //
    IYieldedCount<TFlow>,
    IYieldedSumBy<T, TFlow>,
    IYieldedToSorted<T, TFlow>,
    IYieldedToReversed<T, TFlow>,
    IYieldedToArray<T, TFlow>,
    IYieldedFirst<T, TFlow>,
    IYieldedLast<T, TFlow>,
    IYieldedConsume<TFlow>,
    IYieldedForEach<T, TFlow>,
    IYieldedToSet<T, TFlow> {}

/** If 'sync' then T otherwise Promise<T> */
export type IResolverReturn<
  T,
  TFlow extends IYieldedFlow,
> = TFlow extends "sync" ? T : Promise<T>;
