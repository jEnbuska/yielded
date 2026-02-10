import type { IYieldedLift } from "../generators/apply/lift.ts";
import type { IYieldedParallel } from "../generators/apply/parallel.ts";
import type { IYieldedReverse } from "../generators/apply/reversed.ts";
import type { IYieldedSorted } from "../generators/apply/sorted.ts";
import type { ISharedYieldedOperations } from "../generators/types.ts";
import type { IAsyncYieldedResolver } from "../resolvers/async/types.ts";

export interface IAsyncYielded<T>
  extends
    ISharedYieldedOperations<T, "async">,
    IYieldedLift<T, "async">,
    IYieldedSorted<T, "async">,
    IYieldedReverse<T, "async">,
    IAsyncYieldedResolver<T>,
    IYieldedParallel<T> {}

export type IAsyncYieldedSource<T> =
  | AsyncIterable<T, unknown, unknown>
  | AsyncGenerator<T, unknown, unknown>
  | Promise<T[]>;

export type IYieldedSource<T> =
  T extends IAsyncYieldedSource<T>
    ? never
    : Iterable<T> | Generator<T, unknown, unknown>;
