import type { IYieldedAwaited } from "../generators/apply/awaited.ts";
import type { IYieldedParallel } from "../generators/apply/parallel.ts";
import type { ISharedYieldedOperations } from "../generators/types.ts";
import type { IParallelYieldedResolver } from "../resolvers/parallel/types.ts";

export interface IParallelYielded<T>
  extends
    ISharedYieldedOperations<T, "parallel">,
    IParallelYieldedResolver<T>,
    IYieldedAwaited<T>,
    IYieldedParallel<T> {}
