import type { IYieldedAwaited } from "../generators/apply/awaited.ts";
import type { IYieldedParallel } from "../generators/apply/parallel.ts";
import type { IYieldedOperations } from "../generators/types.ts";
import type { IParallelYieldedResolver } from "../resolvers/parallel/types.ts";

export interface IParallelYielded<T>
  extends
    IYieldedOperations<T, "parallel">,
    IParallelYieldedResolver<T>,
    IYieldedAwaited<T>,
    IYieldedParallel<T> {}
