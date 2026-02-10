import { AsyncYielded } from "../async/AsyncYielded.ts";
import type {
  IAsyncYielded,
  IAsyncYieldedSource,
  IYieldedSource,
} from "../async/types.ts";
import type { IYieldedIterableSource } from "../general/types.ts";
import { syncToAwaited } from "../generators/apply/awaited.ts";
import { batchSync } from "../generators/apply/batch.ts";
import { chunkBySync } from "../generators/apply/chunkBy.ts";
import { dropLastSync } from "../generators/apply/dropLast.ts";
import { flatSync } from "../generators/apply/flat.ts";
import { flatMapSync } from "../generators/apply/flatMap.ts";
import { liftSync } from "../generators/apply/lift.ts";
import { mapPairwiseSync } from "../generators/apply/mapPairwise.ts";
import { parallel } from "../generators/apply/parallel.ts";
import { reversedSync } from "../generators/apply/reversed.ts";
import { sortedSync } from "../generators/apply/sorted.ts";
import { takeLastSync } from "../generators/apply/takeLast.ts";
import { takeWhileSync } from "../generators/apply/takeWhile.ts";
import { tapSync } from "../generators/apply/tap.ts";
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

  /** Creates AsyncYielded from a Promise of an array
   * @example
   * Yielded<number>.from(Promise.resolve([1,2,3]))
   */
  static from<T>(promise: Promise<T[]>): IAsyncYielded<T>;

  /** Creates AsyncYielded from a Promise
   * @example
   * Yielded<number>.from(Promise.resolve(1))
   */
  static from<T>(promise: Promise<T>): IAsyncYielded<T>;

  /** Creates Yielded from any Iterable (Array, Set, Generator, ...)
   *
   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/from}
   *
   * @example
   * Yielded<number>.from([1,2,3])
   * */
  static from<T>(iterable: Iterable<T, unknown, unknown>): IYielded<T>;

  /** Creates AsyncYielded from any AsyncIterable
   * @example
   * Yielded.from(asyncGeneratorFunction())
   * */
  static from<T>(
    asyncIterable:
      | AsyncIterable<T, unknown, unknown>
      | AsyncGenerator<T, unknown, unknown>,
  ): IAsyncYielded<T>;

  static from(source: any) {
    const iterable: any = Yielded.#extractIterable(source);
    if (iterable[Symbol.asyncIterator]) {
      return new AsyncYielded<unknown>(
        undefined,
        iterable[Symbol.asyncIterator](),
      ) as any;
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

  static concat<T>(...sources: Array<IYieldedSource<T>>): IYielded<T>;

  static concat<T>(...sources: Array<IAsyncYieldedSource<T>>): IAsyncYielded<T>;

  static concat<T>(
    ...sources: Array<IYieldedSource<T> | IAsyncYieldedSource<T>>
  ): IAsyncYielded<T>;

  static concat(...sources: Array<any>): any {
    const iterables = sources.map(Yielded.#extractIterable);
    const isAsync = iterables.some(
      (source: any) => !!source?.[Symbol.asyncIterator],
    );
    if (isAsync) {
      return AsyncYielded.from(
        (async function* () {
          for (const iterable of iterables) {
            if (iterable?.[Symbol.asyncIterator]) {
              for await (const next of iterable) yield next;
            } else if (iterable?.[Symbol.iterator]) {
              yield* iterable;
            } else {
              yield iterable;
            }
          }
        })(),
      );
    }
    return new Yielded<any>(
      undefined,
      (function* () {
        for (const iterable of iterables) {
          yield* iterable;
        }
      })(),
    );
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

  filter(predicate: (next: T, index: number) => unknown) {
    return new Yielded(this.generator, this.generator.filter(predicate));
  }

  map<TOut>(mapper: (next: T, index: number) => TOut): IYielded<TOut> {
    return new Yielded(this.generator, this.generator.map(mapper));
  }

  drop(...args: Parameters<IYielded<T>["drop"]>): IYielded<T> {
    return new Yielded(this.generator, this.generator.drop(...args));
  }

  take(...args: Parameters<IYielded<T>["take"]>) {
    this.generator.take(...args);
    return new Yielded(this.generator, this.generator.take(...args));
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
