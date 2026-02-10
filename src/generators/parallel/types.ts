import type {
  IMaybeAsync,
  IYieldedIterableSource,
} from "../../general/types.ts";
import type { ISharedYieldedOperations } from "../types.ts";

export type IYieldedParallelGenerator<TOut = unknown> = AsyncGenerator<
  TOut,
  undefined | void,
  void
>;

export type IParallelCallbackReturn<TOut> =
  | void
  | "STOP"
  | IYieldedIterableSource<TOut, "parallel">;

export type IParallelGeneratorState = "running" | "done" | "aborted";

export type IParallelGeneratorOnNext<T, TOut> = (
  value: T,
) => IMaybeAsync<IParallelCallbackReturn<TOut>>;

export type IParallelGeneratorOnDone<TOut> =
  () => IMaybeAsync<void | IYieldedIterableSource<TOut, "parallel">>;

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
