import type { IMaybeAsync, IYieldedIterableSource } from "../general/types.ts";
import { batchAsync } from "../generators/apply/batch.ts";
import { chunkByAsync } from "../generators/apply/chunkBy.ts";
import { dropAsync } from "../generators/apply/drop.ts";
import { dropLastAsync } from "../generators/apply/dropLast.ts";
import { filterAsync } from "../generators/apply/filter.ts";
import { flatAsync } from "../generators/apply/flat.ts";
import { flatMapAsync } from "../generators/apply/flatMap.ts";
import { liftAsync } from "../generators/apply/lift.ts";
import { mapAsync } from "../generators/apply/map.ts";
import { mapPairwiseAsync } from "../generators/apply/mapPairwise.ts";
import { parallel } from "../generators/apply/parallel.ts";
import { reversedAsync } from "../generators/apply/reversed.ts";
import { sortedAsync } from "../generators/apply/sorted.ts";
import { takeAsync } from "../generators/apply/take.ts";
import { takeLastAsync } from "../generators/apply/takeLast.ts";
import { takeWhileAsync } from "../generators/apply/takeWhile.ts";
import { tapAsync } from "../generators/apply/tap.ts";
import {
  isAsyncIterable,
  isIterable,
} from "../generators/apply/utils/iteration.ts";
import { assertNotNegative } from "../generators/apply/utils/take.ts";
import type { IYieldedAsyncGenerator } from "../generators/async/types.ts";
import type { IDisposableParent } from "../generators/types.ts";
import { ParallelYielded } from "../parallel/ParallelYielded.ts";
import type { IParallelYielded } from "../parallel/types.ts";
import { AsyncYieldedResolver } from "../resolvers/async/AsyncYieldedResolver.ts";
import type { ISharedYieldedResolver } from "../resolvers/types.ts";
import type { IAsyncYielded } from "./types.ts";

export class AsyncYielded<T>
  extends AsyncYieldedResolver<T>
  implements IAsyncYielded<T>
{
  public constructor(
    parent: IDisposableParent,
    generator: IYieldedAsyncGenerator<T>,
  ) {
    super(parent, generator);
  }

  static from<T>(
    source:
      | IMaybeAsync<
          | AsyncGenerator<T, unknown, unknown>
          | AsyncIterable<T, unknown, unknown>
        >
      | Promise<Iterable<T>>,
  ): AsyncYielded<T> {
    return AsyncYielded.from(
      (async function* () {
        const out = await source;

        if (isAsyncIterable(out)) {
          for await (const next of out) yield next;
        } else if (isIterable(out)) {
          yield yield* await source;
        } else {
          yield source;
        }
      })(),
    );
  }

  #next<TNext, TArgs extends any[]>(
    next: (
      generator: IYieldedAsyncGenerator<T>,
      ...args: TArgs
    ) => IYieldedAsyncGenerator<TNext>,
    ...args: TArgs
  ) {
    return new AsyncYielded<TNext>(
      this.generator,
      next(this.generator, ...args),
    );
  }

  batch(...args: Parameters<IAsyncYielded<T>["batch"]>) {
    return this.#next(batchAsync, ...args);
  }

  chunkBy(...args: Parameters<IAsyncYielded<T>["chunkBy"]>) {
    return this.#next(chunkByAsync, ...args);
  }

  filter<TOut extends T>(
    fn: (next: T, index: number) => next is TOut,
  ): AsyncYielded<TOut>;

  filter(fn: (next: T, index: number) => any): AsyncYielded<T>;

  filter(...args: unknown[]) {
    // @ts-expect-error
    return this.#next(filterAsync, ...args);
  }

  flat<Depth extends number = 1>(
    depth?: Depth,
  ): AsyncYielded<FlatArray<T[], Depth>> {
    return this.#next(flatAsync, depth);
  }

  flatMap<TOut>(
    callback: (
      value: T,
      index: number,
    ) => IMaybeAsync<
      readonly TOut[] | IYieldedIterableSource<TOut, "async"> | TOut
    >,
  ) {
    return this.#next(flatMapAsync, callback);
  }

  lift<TOut = never>(
    middleware: (generator: IYieldedAsyncGenerator<T>) => AsyncGenerator<TOut>,
  ) {
    return this.#next(liftAsync, middleware);
  }

  map<TOut>(mapper: (next: T, index: number) => IMaybeAsync<TOut>) {
    return this.#next(mapAsync, mapper);
  }

  drop(count: number) {
    assertNotNegative(count);
    return this.#next(dropAsync, count);
  }

  dropLast(count: number) {
    assertNotNegative(count);
    return this.#next(dropLastAsync, count);
  }

  take(count: number) {
    assertNotNegative(count);
    return this.#next(takeAsync, count);
  }

  takeLast(count: number) {
    assertNotNegative(count);
    return this.#next(takeLastAsync, count);
  }

  takeWhile(...args: Parameters<IAsyncYielded<T>["takeWhile"]>) {
    return this.#next(takeWhileAsync, ...args);
  }

  tap(...args: Parameters<IAsyncYielded<T>["tap"]>) {
    return this.#next(tapAsync, ...args);
  }

  reversed() {
    return this.#next(reversedAsync);
  }

  sorted(...args: Parameters<IAsyncYielded<T>["sorted"]>) {
    return this.#next(sortedAsync, ...args);
  }

  parallel(parallelCount: number): IParallelYielded<Awaited<T>> {
    return new ParallelYielded<Awaited<T>>(
      this.generator,
      parallel(this.generator, parallelCount),
      parallelCount,
    );
  }

  mapPairwise<TOut>(mapper: (previous: T, next: T) => IMaybeAsync<TOut>) {
    return this.#next(mapPairwiseAsync, mapper);
  }

  withSignal(signal?: AbortSignal): ISharedYieldedResolver<T, "async"> {
    return new AsyncYieldedResolver<T>(this.parent, this.generator, signal);
  }
}
