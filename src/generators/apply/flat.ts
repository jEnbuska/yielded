import type { INextYielded, IYieldedFlow } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IParallelGeneratorSubConfig } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";

export interface IYieldedFlat<T, TFlow extends IYieldedFlow> {
  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat}
   *
   * Returns a new sequence where all sub-array elements are recursively
   * concatenated into it up to the specified depth.
   *
   * By default, `depth` is `1`, meaning only the first level of nested arrays
   * will be flattened. Supports deeper levels by specifying a `depth`.
   *
   * @example
   * ```ts
   * Yielded.from([[1], [2], [3]])
   *   .flat()
   *   .toArray() satisfies number[] // [1, 2, 3]
   * ```
   * ```ts
   * Yielded.from([[1], [[2]], [[[3]]]])
   *   .flat(2)
   *   .toArray() satisfies Array<number | number[]> // [1, 2, [3]]
   * ```
   * ```ts
   * Yielded.from([1, [2, [3, 4]], 5])
   *   .flat()
   *   .toArray() satisfies Array<number | number[]> // [1, 2, [3, 4], 5]
   * ```
   */
  flat<Depth extends number = 1>(
    depth?: Depth,
  ): INextYielded<FlatArray<T[], Depth>, TFlow>;
}

function nextToFlat<T, const Depth extends number = 1>(
  next: T,
  depth: Depth,
): Array<FlatArray<T[], Depth>> {
  if (!Array.isArray(next) || depth <= 0) {
    return [next] as any;
  }
  return next.flat(depth - 1) as any;
}

export function* flatSync<T, const Depth extends number = 1>(
  generator: IYieldedSyncGenerator<T>,
  depth?: Depth,
): IYieldedSyncGenerator<FlatArray<T[], Depth>> {
  depth = depth ?? (1 as Depth);
  for (const next of generator) yield* nextToFlat(next, depth);
}

export async function* flatAsync<T, const Depth extends number = 1>(
  generator: IYieldedAsyncGenerator<T>,
  depth?: Depth,
): IYieldedAsyncGenerator<FlatArray<T[], Depth>> {
  depth = depth ?? (1 as Depth);
  for await (const next of generator) yield* nextToFlat(next, depth);
}

export function flatParallel<T, const Depth extends number = 1>(
  depth?: Depth,
): IParallelGeneratorSubConfig<T, FlatArray<T[], Depth>> {
  depth = depth ?? (1 as Depth);
  return {
    name: "flat",
    onNext: (next) => nextToFlat(next, depth),
  };
}
