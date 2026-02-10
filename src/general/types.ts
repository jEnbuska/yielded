import type { IAsyncYielded } from "../async/types.ts";
import type { IParallelYielded } from "../parallel/types.ts";
import type { IYielded } from "../sync/types.ts";

export type INextYielded<T, TFlow extends IYieldedFlow> = TFlow extends "async"
  ? IAsyncYielded<T>
  : TFlow extends "parallel"
    ? IParallelYielded<T>
    : IYielded<T>;

export type IMaybeAsync<T> = Promise<T> | T;

export type IMaybeAwaited<T, Flow extends IYieldedFlow> = Flow extends "sync"
  ? T
  : Awaited<T>;

export type IYieldedFlow = "sync" | "async" | "parallel";

export type IYieldedIterableSource<
  T,
  TFlow extends IYieldedFlow,
> = TFlow extends "sync"
  ?
      | Iterable<T, void | undefined, void | undefined>
      | Iterator<T, undefined | void, undefined | void>
  :
      | Iterable<IMaybeAsync<T>, undefined | void, undefined | void>
      | Iterator<IMaybeAsync<T>, undefined | void, undefined | void>
      | AsyncIterable<IMaybeAsync<T>, void | undefined, void | undefined>
      | AsyncIterator<IMaybeAsync<T>, void | undefined, void | undefined>;
