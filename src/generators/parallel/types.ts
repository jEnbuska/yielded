import type { ISharedYieldedOperations } from "../types.ts";

export type IYieldedParallelGenerator<TOut = unknown> = AsyncGenerator<
  TOut,
  undefined | void,
  void
>;

export type OnNextGenerator<TOut> = AsyncGenerator<
  TOut,
  // If STOP is returned, the parallel generator will stop processing further items and complete immediately.
  // Note! STOP must be returd otherwise it will
  undefined | void | "STOP",
  void | undefined
>;

export type OnNextIterable<TOut> = AsyncIteratorObject<
  TOut,
  undefined | void | "STOP",
  undefined | void
>;

export type IParallelGeneratorState = "running" | "done" | "aborted";

export type IParallelGeneratorOnNext<T, TOut> = (
  value: T,
) => OnNextGenerator<TOut>;

export type IParallelGeneratorOnDone<TOut> = () => OnNextGenerator<TOut>;

export type IParallelGeneratorSubConfig<T, TOut = T> = {
  onNext?: IParallelGeneratorOnNext<T, TOut>;
  onDone?: IParallelGeneratorOnDone<TOut>;
  name: IParallelGeneratorName;
};

export type IParallelGeneratorName =
  | keyof ISharedYieldedOperations<any, any>
  | "parallel"
  | "awaited"
  | "_test";
