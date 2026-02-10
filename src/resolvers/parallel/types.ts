import type { IYieldedGenerator } from "../../generators/types.ts";
import type { ISharedYieldedResolver } from "../types.ts";

export interface IParallelYieldedResolver<T> extends ISharedYieldedResolver<
  T,
  "parallel"
> {
  [Symbol.asyncIterator](): IYieldedGenerator<T, "parallel">;
}
