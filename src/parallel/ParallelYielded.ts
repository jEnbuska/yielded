import { AsyncYielded } from "../async/AsyncYielded.ts";
import type { IAsyncYielded } from "../async/types.ts";
import type { IMaybeAsync, IYieldedIterableSource } from "../general/types.ts";
import { parallelToAwaited } from "../generators/apply/awaited.ts";
import { batchParallel } from "../generators/apply/batch.ts";
import { chunkByParallel } from "../generators/apply/chunkBy.ts";
import { dropParallel } from "../generators/apply/drop.ts";
import { dropLastParallel } from "../generators/apply/dropLast.ts";
import { filterParallel } from "../generators/apply/filter.ts";
import { flatParallel } from "../generators/apply/flat.ts";
import { flatMapParallel } from "../generators/apply/flatMap.ts";
import { mapParallel } from "../generators/apply/map.ts";
import { mapPairwiseParallel } from "../generators/apply/mapPairwise.ts";
import { parallelUpdate } from "../generators/apply/parallel.ts";
import { takeParallel } from "../generators/apply/take.ts";
import { takeLastParallel } from "../generators/apply/takeLast.ts";
import { takeWhileParallel } from "../generators/apply/takeWhile.ts";
import { tapParallel } from "../generators/apply/tap.ts";
import {
  assertNotNegative,
  getEmptyAsyncGenerator,
} from "../generators/apply/utils/take.ts";
import { ParallelGenerator } from "../generators/parallel/ParallelGenerator.ts";
import type {
  IParallelGeneratorSubConfig,
  IYieldedParallelGenerator,
} from "../generators/parallel/types.ts";
import type { IDisposableParent } from "../generators/types.ts";
import { ParallelYieldedResolver } from "../resolvers/parallel/ParallelYieldedResolver.ts";
import type { ISharedYieldedResolver } from "../resolvers/types.ts";
import type { IParallelYielded } from "./types.ts";

export class ParallelYielded<T>
  extends ParallelYieldedResolver<T>
  implements IParallelYielded<T>
{
  public constructor(
    parent: IDisposableParent,
    generator: IYieldedParallelGenerator<T>,
    parallel: number,
  ) {
    super(parent, generator, parallel);
  }

  #next<TNext, TArgs extends any[]>(
    next: (...args: TArgs) => IParallelGeneratorSubConfig<T, TNext>,
    ...args: TArgs
  ): IParallelYielded<TNext> {
    const nextGenerator = ParallelGenerator.create({
      generator: this.generator,
      parallel: this._parallel,
      ...next(...args),
    });
    return new ParallelYielded<TNext>(
      this.generator,
      nextGenerator,
      this._parallel,
    );
  }

  batch(...args: Parameters<IParallelYielded<T>["batch"]>) {
    return this.#next(batchParallel, ...args);
  }

  chunkBy(...args: Parameters<IParallelYielded<T>["chunkBy"]>) {
    return this.#next(chunkByParallel, ...args);
  }

  filter<TOut extends T>(fn: (next: T) => next is TOut): IParallelYielded<T>;

  filter(fn: (next: T) => any): IParallelYielded<T>;

  filter(...args: unknown[]) {
    // @ts-expect-error
    return this.#next(filterParallel, ...args);
  }

  flat<Depth extends number = 1>(depth?: Depth) {
    return this.#next(flatParallel<T, Depth>, depth);
  }

  flatMap<TOut>(
    callback: (
      value: T,
      index: number,
    ) => IMaybeAsync<
      readonly TOut[] | IYieldedIterableSource<TOut, "parallel"> | TOut
    >,
  ) {
    return this.#next(flatMapParallel, callback);
  }

  map<TOut>(mapper: (next: T, index: number) => IMaybeAsync<TOut>) {
    return this.#next(mapParallel, mapper);
  }

  drop(count: number) {
    assertNotNegative(count);
    return this.#next(dropParallel<T>, count);
  }

  dropLast(count: number) {
    assertNotNegative(count);
    return this.#next(dropLastParallel<T>, count);
  }

  take(count: number): IParallelYielded<T> {
    assertNotNegative(count);
    if (count) {
      return this.#next(takeParallel<T>, count);
    }
    return new ParallelYielded(
      this.generator,
      getEmptyAsyncGenerator<T>(),
      this._parallel,
    );
  }

  takeLast(count: number) {
    assertNotNegative(count);
    return this.#next(takeLastParallel<T>, count);
  }

  takeWhile(...args: Parameters<IParallelYielded<T>["takeWhile"]>) {
    return this.#next(takeWhileParallel, ...args);
  }

  tap(...args: Parameters<IAsyncYielded<T>["tap"]>) {
    return this.#next(tapParallel, ...args);
  }

  awaited(): IAsyncYielded<Awaited<T>> {
    return new AsyncYielded<Awaited<T>>(
      this.generator,
      parallelToAwaited(this.generator, this._parallel),
    );
  }

  parallel(count: number): IParallelYielded<Awaited<T>> {
    return new ParallelYielded(
      this.generator,
      parallelUpdate(this.generator, this._parallel, count),
      count,
    );
  }

  mapPairwise<TOut>(mapper: (previous: T, next: T) => IMaybeAsync<TOut>) {
    return this.#next(mapPairwiseParallel, mapper);
  }

  withSignal(signal?: AbortSignal): ISharedYieldedResolver<T, "parallel"> {
    return new ParallelYieldedResolver<T>(
      this.parent,
      this.generator,
      this._parallel,
      signal,
    );
  }
}
