import type { IYieldedAwaited } from "../generators/apply/awaited.ts";
import type { IYieldedLift } from "../generators/apply/lift.ts";
import type { IYieldedParallel } from "../generators/apply/parallel.ts";
import type { IYieldedReverse } from "../generators/apply/reversed.ts";
import type { IYieldedSorted } from "../generators/apply/sorted.ts";
import type { ISharedYieldedOperations } from "../generators/types.ts";
import type { IYieldedResolver } from "../resolvers/sync/types.ts";

export interface IYielded<T>
  extends
    ISharedYieldedOperations<T, "sync">,
    IYieldedLift<T, "sync">,
    IYieldedSorted<T, "sync">,
    IYieldedReverse<T, "sync">,
    IYieldedResolver<T>,
    IYieldedAwaited<T>,
    IYieldedParallel<T> {}
