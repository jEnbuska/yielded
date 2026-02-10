import type { IYieldedGenerator } from "../../generators/types.ts";
import type { ISharedYieldedResolver } from "../types.ts";

export interface IYieldedResolver<T> extends ISharedYieldedResolver<T, "sync"> {
  [Symbol.iterator](): IYieldedGenerator<T, "sync">;
}
