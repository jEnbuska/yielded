import { AsyncYielded } from "../async/AsyncYielded.ts";
import type { IAsyncYielded } from "../async/types.ts";
import type { IMaybeAsync, IYieldedIterableSource } from "../general/types.ts";
import { syncToAwaited } from "../generators/apply/awaited.ts";
import { batchSync } from "../generators/apply/batch.ts";
import { chunkBySync } from "../generators/apply/chunkBy.ts";
import { dropSync } from "../generators/apply/drop.ts";
import { dropLastSync } from "../generators/apply/dropLast.ts";
import { filterSync } from "../generators/apply/filter.ts";
import { flatSync } from "../generators/apply/flat.ts";
import { flatMapSync } from "../generators/apply/flatMap.ts";
import { liftSync } from "../generators/apply/lift.ts";
import { mapSync } from "../generators/apply/map.ts";
import { mapPairwiseSync } from "../generators/apply/mapPairwise.ts";
import { parallel } from "../generators/apply/parallel.ts";
import { reversedSync } from "../generators/apply/reversed.ts";
import { sortedSync } from "../generators/apply/sorted.ts";
import { takeSync } from "../generators/apply/take.ts";
import { takeLastSync } from "../generators/apply/takeLast.ts";
import { takeWhileSync } from "../generators/apply/takeWhile.ts";
import { tapSync } from "../generators/apply/tap.ts";
import { isAsyncIterable } from "../generators/apply/utils/iteration.ts";
import { assertNotNegative } from "../generators/apply/utils/take.ts";
import type { IYieldedSyncGenerator } from "../generators/sync/types.ts";
import type {
  IDisposableParent,
  IYieldedGenerator,
} from "../generators/types.ts";
import { ParallelYielded } from "../parallel/ParallelYielded.ts";
import type { IParallelYielded } from "../parallel/types.ts";
import { YieldedResolver } from "../resolvers/sync/YieldedResolver.ts";
import type { ISharedYieldedResolver } from "../resolvers/types.ts";
import type { IYielded } from "./types.ts";

export class Yielded<T> extends YieldedResolver<T> implements IYielded<T> {
  /** Variable for testing purposes. If set to `true`, it forces the use of polyfill implementations for all operators, even if native implementations are available. This can be useful for testing the correctness and performance of the polyfill versions in environments that support native implementations. */
  static __USE_POLYFILL_ONLY__ = false;

  private constructor(
    parent: IDisposableParent,
    generator: IYieldedSyncGenerator<T>,
  ) {
    super(parent, generator);
  }

  static #extractIterable(source: any): any {
    if (source[Symbol.iterator]) {
      return source;
    }
    if (source[Symbol.asyncIterator]) {
      return source;
    }
    if (source && source instanceof Promise) {
      return (async function* () {
        const result = await source;
        if (Array.isArray(result)) yield* result;
        else yield result;
      })();
    }
    return [source];
  }

  /** Creates Yielded from any Iterable (Array, Set, Generator, ...)
   *
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/from}
   *
   * @example
   * Yielded<number>.from([1,2,3])
   * */
  static from<T>(iterable: Iterable<T, unknown, unknown>): IYielded<T>;

  /** Creates AsyncYielded from a Promise of an array
   * @example
   * Yielded<number>.from(Promise.resolve([1,2,3]))
   */
  static from<T>(promise: Promise<Iterable<T>>): IAsyncYielded<T>;

  /** Creates AsyncYielded from any AsyncIterable
   * @example
   * Yielded.from(asyncGeneratorFunction())
   * */
  static from<T>(
    asyncIterable: IMaybeAsync<
      AsyncIterable<T, unknown, unknown> | AsyncGenerator<T, unknown, unknown>
    >,
  ): IAsyncYielded<T>;

  static from(source: any) {
    const iterable: any = Yielded.#extractIterable(source);
    if (isAsyncIterable(source) || source instanceof Promise) {
      return new AsyncYielded<unknown>(undefined, source as any) as any;
    }
    return new Yielded<unknown>(
      undefined,
      (function* () {
        for (const next of iterable[Symbol.iterator]()) {
          yield next;
        }
      })(),
    ) as any;
  }

  #next<TNext, TArgs extends any[]>(
    next: (
      generator: IYieldedSyncGenerator<T>,
      ...args: TArgs
    ) => IYieldedSyncGenerator<TNext>,
    ...args: TArgs
  ): IYielded<TNext> {
    return new Yielded<TNext>(this.generator, next(this.generator, ...args));
  }

  filter<TOut extends T>(
    predicate: (next: T, index: number) => next is TOut,
  ): IYielded<TOut>;

  filter(predicate: (next: T, index: number) => unknown): IYielded<T>;

  filter(...args: unknown[]) {
    // @ts-ignore
    return this.#next(filterSync, ...args);
  }

  map<TOut>(mapper: (next: T, index: number) => TOut): IYielded<TOut> {
    return this.#next(mapSync, mapper);
  }

  drop(count: number): IYielded<T> {
    assertNotNegative(count);
    return this.#next(dropSync, count);
  }

  take(count: number) {
    assertNotNegative(count);
    return this.#next(takeSync, count);
  }

  flat<Depth extends number = 1>(
    depth?: Depth,
  ): IYielded<FlatArray<T[], Depth>> {
    return this.#next(flatSync, depth);
  }

  flatMap<TOut>(
    flatMapper: (
      next: T,
      index: number,
    ) => readonly TOut[] | IYieldedIterableSource<TOut, "sync"> | TOut,
  ) {
    return this.#next(flatMapSync, flatMapper);
  }

  lift<TOut = never>(
    middleware: (
      generator: IYieldedGenerator<T, "sync">,
    ) => IYieldedGenerator<TOut, "sync">,
  ): IYielded<TOut> {
    return this.#next(liftSync, middleware);
  }

  dropLast(count: number) {
    assertNotNegative(count);
    return this.#next(dropLastSync, count);
  }

  takeLast(count: number) {
    assertNotNegative(count);
    return this.#next(takeLastSync, count);
  }

  takeWhile(...args: Parameters<IYielded<T>["takeWhile"]>) {
    return this.#next(takeWhileSync, ...args);
  }

  tap(...args: Parameters<IYielded<T>["tap"]>) {
    return this.#next(tapSync, ...args);
  }

  awaited(): IAsyncYielded<Awaited<T>> {
    return new AsyncYielded<Awaited<T>>(
      this.generator,
      syncToAwaited(this.generator),
    );
  }

  reversed() {
    return this.#next(reversedSync);
  }

  sorted(...args: Parameters<IYielded<T>["sorted"]>) {
    return this.#next(sortedSync, ...args);
  }

  parallel(count: number): IParallelYielded<Awaited<T>> {
    return new ParallelYielded<Awaited<T>>(
      this.generator,
      parallel(this.generator, count),
      count,
    );
  }

  mapPairwise<TOut>(mapper: (previous: T, next: T) => TOut) {
    return this.#next(mapPairwiseSync, mapper);
  }

  batch(...args: Parameters<IYielded<T>["batch"]>) {
    return this.#next(batchSync, ...args);
  }

  chunkBy(...args: Parameters<IYielded<T>["chunkBy"]>) {
    return this.#next(chunkBySync, ...args);
  }

  withSignal(signal?: AbortSignal): ISharedYieldedResolver<T, "sync"> {
    return new YieldedResolver<T>(this.parent, this.generator, signal);
  }
}
