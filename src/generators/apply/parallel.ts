import type { IParallelYielded } from "../../parallel/types.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import { ParallelGenerator } from "../parallel/ParallelGenerator.ts";
import type { IYieldedParallelGenerator } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";
import { parallelToAwaited } from "./awaited.ts";

export type IYieldedParallel<T> = {
  /**
   * Enables parallel processing for the **next asynchronous operation**.
   * NOTE. Parallelization adds some overhead and only truly benefits operations that involve independent asynchronous work,
   *
   * By default, items are processed sequentially (one at a time).
   * Calling `parallel(count)` configures the pipeline so that the
   * **following async-producing operation** may run with up to
   * `count` items in flight simultaneously.
   *
   * This setting does not retroactively affect previous operations
   * in the pipeline — it applies only to the next async operation.
   *
   * As soon as one operation completes, the next pending item
   * is started, keeping at most `count` operations active.
   *
   * Results are yielded in **order of completion**, not in the
   * original input order.
   *
   * This is useful for increasing throughput when performing
   * independent asynchronous work such as network requests,
   * timers, or I/O.
   *
   * @example
   * ```ts
   * Yielded.from([550, 450, 300, 10, 100])
   *  .map((m) => sleep(m).then(() => it))
   *  .awaited()
   *  .parallel(3)
   *  .toArray() // Promise<[300, 10, 100, 450, 550]>
   */
  parallel(count: number): IParallelYielded<Awaited<T>>;
};

export function parallel<T>(
  generator: (IYieldedAsyncGenerator<T> | IYieldedSyncGenerator<T>) &
    Disposable,
  parallel: number,
): IYieldedParallelGenerator<Awaited<T>> {
  return ParallelGenerator.create<T, Awaited<T>>({
    name: "parallel",
    parallel,
    generator,
  });
}

export function parallelUpdate<T>(
  generator: IYieldedParallelGenerator<T> & Disposable,
  currentParallel: number,
  nextParallel: number,
): IYieldedParallelGenerator<Awaited<T>> {
  return ParallelGenerator.create<T, Awaited<T>>({
    name: "parallel",
    parallel: nextParallel,
    generator: parallelToAwaited(generator, currentParallel),
  });
}
