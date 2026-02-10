import type { ISharedYieldedResolver } from "../types.ts";

export interface IAsyncYieldedResolver<T> extends ISharedYieldedResolver<
  T,
  "async"
> {
  next(value?: undefined): Promise<IteratorResult<T, void | undefined>>;
  return(value?: undefined): Promise<IteratorResult<T, void | undefined>>;
  throw(e: any): Promise<IteratorResult<T, void | undefined>>;
  [Symbol.asyncDispose](): Promise<void>;
  [Symbol.asyncIterator](): AsyncGenerator<
    T,
    void | undefined,
    void | undefined
  >;
}
