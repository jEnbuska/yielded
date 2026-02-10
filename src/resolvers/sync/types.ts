import type { ISharedYieldedResolver } from "../types.ts";

export interface IYieldedResolver<T> extends ISharedYieldedResolver<T, "sync"> {
  next(value?: undefined): IteratorResult<T, void | undefined>;
  return(value?: undefined): IteratorResult<T, void | undefined>;
  throw(e: any): IteratorResult<T, void | undefined>;
  [Symbol.iterator](): Generator<T, void | undefined, void | undefined>;
}
