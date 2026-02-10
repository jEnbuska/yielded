import type { IYieldedFlow } from "../general/types.ts";
import type { IYieldedToSet } from "../resolvers/apply/toSet.ts";
import type { ISharedYieldedResolver } from "../resolvers/types.ts";
import type { IYieldedBatch } from "./apply/batch.ts";
import type { IYieldedChunkBy } from "./apply/chunkBy.ts";
import type { IYieldedDrop } from "./apply/drop.ts";
import type { IYieldedDropLast } from "./apply/dropLast.ts";
import type { IYieldedFilter } from "./apply/filter.ts";
import type { IYieldedFlat } from "./apply/flat.ts";
import type { IYieldedFlatMap } from "./apply/flatMap.ts";
import type { IYieldedLift } from "./apply/lift.ts";
import type { IYieldedMap } from "./apply/map.ts";
import type { IYieldedMapPairwise } from "./apply/mapPairwise.ts";
import type { IYieldedTake } from "./apply/take.ts";
import type { IYieldedTakeLast } from "./apply/takeLast.ts";
import type { IYieldedTakeWhile } from "./apply/takeWhile.ts";
import type { IYieldedTap } from "./apply/tap.ts";
import type { IYieldedAsyncGenerator } from "./async/types.ts";
import type { IYieldedParallelGenerator } from "./parallel/types.ts";
import type { IYieldedSyncGenerator } from "./sync/types.ts";

export type IYieldedGenerator<
  T,
  TFlow extends IYieldedFlow,
> = TFlow extends "async"
  ? IYieldedAsyncGenerator<T>
  : TFlow extends "parallel"
    ? IYieldedParallelGenerator<T>
    : IYieldedSyncGenerator<T>;

export type ICallbackReturn<
  T,
  TFlow extends IYieldedFlow,
> = TFlow extends "sync" ? T : Promise<T> | T;

export interface IYieldedOperations<T, TFlow extends IYieldedFlow>
  extends
    IYieldedChunkBy<T, TFlow>,
    IYieldedBatch<T, TFlow>,
    IYieldedDrop<T, TFlow>,
    IYieldedDropLast<T, TFlow>,
    IYieldedTake<T, TFlow>,
    IYieldedTakeLast<T, TFlow>,
    IYieldedTakeWhile<T, TFlow>,
    IYieldedFilter<T, TFlow>,
    IYieldedMap<T, TFlow>,
    IYieldedFlatMap<T, TFlow>,
    IYieldedFlat<T, TFlow>,
    IYieldedLift<T, TFlow>,
    IYieldedTap<T, TFlow>,
    IYieldedToSet<T, TFlow>,
    IYieldedMapPairwise<T, TFlow> {
  withSignal(signal?: AbortSignal): ISharedYieldedResolver<T, TFlow>;
}

export type IDisposableParent =
  | (Disposable & (IteratorObject<any> | AsyncGenerator<any>))
  | undefined;
