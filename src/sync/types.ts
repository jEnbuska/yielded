import type { IYieldedAwaited } from "../generators/apply/awaited.ts";
import type { IYieldedParallel } from "../generators/apply/parallel.ts";
import type { IYieldedReverse } from "../generators/apply/reversed.ts";
import type { IYieldedSorted } from "../generators/apply/sorted.ts";
import type { IYieldedOperations } from "../generators/types.ts";
import type { IYieldedResolver } from "../resolvers/sync/types.ts";

export interface IYielded<T>
  extends
    IYieldedOperations<T, "sync">,
    IYieldedSorted<T, "sync">,
    IYieldedReverse<T, "sync">,
    IYieldedResolver<T>,
    IYieldedAwaited<T>,
    IYieldedParallel<T> {}
