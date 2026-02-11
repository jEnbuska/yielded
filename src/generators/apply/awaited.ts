import type { IAsyncYielded } from "../../async/types.ts";
import { createResolvable } from "../../general/utils/createResolvable.ts";
import { ParallelGeneratorResolver } from "../../resolvers/parallel/ParallelGeneratorResolver.ts";
import type { IYieldedAsyncGenerator } from "../async/types.ts";
import type { IYieldedParallelGenerator } from "../parallel/types.ts";
import type { IYieldedSyncGenerator } from "../sync/types.ts";

export interface IYieldedAwaited<T> {
  /**
   * Converts a sequence of possibly asynchronous items into a fully asynchronous
   * generator. All items yielded by the upstream generator are awaited before
   * being passed to the next operation.
   *
   * This ensures that downstream operations always receive resolved values in the same order,
   * allowing you to safely work with Promises in a chain of generator operations.
   *
   * @example
   * ```ts
   * Yielded.from([1,2,3])
   *  .map(n => Promise.resolve(n))
   *  .awaited()
   *  .map(n => n * 2)
   *  .toArray() satisfies Promise<number[]> // Promise<[2,4,6]>
   * ```
   *  ```ts
   *  // Order may change if Promises are resolved at different times and parallel
   * Yielded.from([100, 200, 50, 10])
   * .map(n => sleep(n))
   * .awaited()
   * .parallel(4)
   * .toArray() satisfies Promise<number[]> // [10, 50, 100, 200]
   * ```
   */
  awaited(): IAsyncYielded<Awaited<T>>;
}

export async function* syncToAwaited<T>(
  generator: IYieldedSyncGenerator<T>,
): IYieldedAsyncGenerator<Awaited<T>> {
  for (const next of generator) {
    yield next;
  }
}

export async function* parallelToAwaited<T>(
  generator: IYieldedParallelGenerator<T>,
  parallel: number,
  signal?: AbortSignal,
): IYieldedAsyncGenerator<Awaited<T>> {
  let done = false;
  const buffer: T[] = [];
  let consumerResolvable = createResolvable<void>();
  let producerResolvable = createResolvable<void>();
  void ParallelGeneratorResolver.run<T, void>({
    name: "consume",
    generator,
    signal,
    parallel,
    async onNext(value) {
      buffer.push(value);
      consumerResolvable.resolve();
      if (parallel <= buffer.length) {
        await producerResolvable.promise;
        producerResolvable = createResolvable();
      }
    },
    onDone(resolve) {
      consumerResolvable.resolve();
      resolve();
      done = true;
    },
  });

  while (true) {
    while (buffer.length) {
      yield buffer.shift()!;
      producerResolvable.resolve();
    }
    if (done) return;
    await consumerResolvable.promise;
    consumerResolvable = createResolvable();
  }
}
