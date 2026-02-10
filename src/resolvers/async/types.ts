import type { IYieldedGenerator } from "../../generators/types.ts";
import type { ISharedYieldedResolver } from "../types.ts";

export interface IAsyncYieldedResolver<T> extends ISharedYieldedResolver<
  T,
  "async"
> {
  [Symbol.asyncIterator](): IYieldedGenerator<T, "async">;
}
