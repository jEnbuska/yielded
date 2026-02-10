import type { IMaybeAsync } from "../../general/types.ts";
import type { IYieldedAsyncGenerator } from "../../generators/async/types.ts";
import type { IDisposableParent } from "../../generators/types.ts";
import { consumeAsync } from "../apply/consume.ts";
import { countAsync } from "../apply/count.ts";
import { everyAsync } from "../apply/every.ts";
import { findAsync } from "../apply/find.ts";
import { firstAsync } from "../apply/first.ts";
import { forEachAsync } from "../apply/forEach.ts";
import { groupByAsync } from "../apply/groupBy.ts";
import { lastAsync } from "../apply/last.ts";
import { maxByAsync } from "../apply/maxBy.ts";
import { minByAsync } from "../apply/minBy.ts";
import { reduceAsync } from "../apply/reduce.ts";
import { someAsync } from "../apply/some.ts";
import { sumByAsync } from "../apply/sumBy.ts";
import { toArrayAsync } from "../apply/toArray.ts";
import { toReversedAsync } from "../apply/toReversed.ts";
import { toSetAsync } from "../apply/toSet.ts";
import { toSortedAsync } from "../apply/toSorted.ts";
import { ResolversDisposableParent } from "../ResolversDisposableParent.ts";
import type { IYieldedResolver } from "../sync/types.ts";
import type { IAsyncYieldedResolver } from "./types.ts";

export class AsyncYieldedResolver<T>
  extends ResolversDisposableParent<IYieldedAsyncGenerator<T>>
  implements IAsyncYieldedResolver<T>
{
  protected constructor(
    parent: IDisposableParent,
    generator: IYieldedAsyncGenerator<T>,
    signal?: AbortSignal,
  ) {
    super(parent, generator, signal);
  }

  async *[Symbol.asyncIterator]() {
    using generator = this.generator;
    for await (const next of generator) {
      yield next;
    }
  }

  async #apply<TArgs extends any[], TReturn>(
    cb: (...args: [IYieldedAsyncGenerator<T>, ...TArgs]) => Promise<TReturn>,
    ...args: TArgs
  ): Promise<TReturn> {
    using generator = this.generator;
    return await cb(generator, ...args);
  }

  forEach(...args: Parameters<IAsyncYieldedResolver<T>["forEach"]>) {
    return this.#apply(forEachAsync, ...args);
  }

  reduce<TOut>(
    reducer: (acc: TOut, next: T, index: number) => IMaybeAsync<TOut>,
    initialValue: IMaybeAsync<TOut>,
  ): Promise<TOut>;

  reduce(reducer: (acc: T, next: T, index: number) => T): Promise<T>;

  reduce(...args: unknown[]) {
    // @ts-expect-error
    return this.#apply(reduceAsync, ...args);
  }

  toArray() {
    return this.#apply(toArrayAsync);
  }

  toSet() {
    return this.#apply(toSetAsync);
  }

  every(...args: Parameters<IAsyncYieldedResolver<T>["every"]>) {
    return this.#apply(everyAsync, ...args);
  }

  find<TOut extends T>(
    predicate: (next: T) => next is TOut,
  ): Promise<TOut | undefined>;

  find(predicate: (next: T) => unknown): Promise<T | undefined>;

  find(...args: unknown[]) {
    // @ts-expect-error
    return this.#apply(findAsync, ...args);
  }

  some(...args: Parameters<IAsyncYieldedResolver<T>["some"]>) {
    return this.#apply(someAsync, ...args);
  }

  toSorted(...args: Parameters<IYieldedResolver<T>["toSorted"]>) {
    return this.#apply(toSortedAsync, ...args);
  }

  toReversed() {
    return this.#apply(toReversedAsync);
  }

  minBy(selector: (next: T, index: number) => IMaybeAsync<number>): Promise<T>;

  minBy<TDefault>(
    selector: (next: T, index: number) => IMaybeAsync<number>,
    defaultValue: TDefault,
  ): Promise<T | TDefault>;

  minBy(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(minByAsync, ...args);
  }

  maxBy(selector: (next: T, index: number) => IMaybeAsync<number>): Promise<T>;

  maxBy<TDefault>(
    selector: (next: T, index: number) => IMaybeAsync<number>,
    defaultValue: TDefault,
  ): Promise<T | TDefault>;

  maxBy(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(maxByAsync, ...args);
  }

  sumBy(...args: Parameters<IAsyncYieldedResolver<T>["sumBy"]>) {
    return this.#apply(sumByAsync, ...args);
  }

  count(...args: Parameters<IAsyncYieldedResolver<T>["count"]>) {
    return this.#apply(countAsync, ...args);
  }

  groupBy<TKey extends PropertyKey, const TGroups extends PropertyKey>(
    keySelector: (next: T) => Promise<TKey> | TKey,
    groups: TGroups[],
  ): Promise<
    Record<TGroups, T[]> & Partial<Record<Exclude<TKey, TGroups>, T[]>>
  >;

  groupBy<TKey extends PropertyKey>(
    keySelector: (next: T) => Promise<TKey> | TKey,
    groups?: undefined,
  ): Promise<Partial<Record<TKey, T[]>>>;

  groupBy(...args: unknown[]): any {
    // @ts-expect-error
    return this.#apply(groupByAsync, ...args);
  }

  consume() {
    return this.#apply(consumeAsync);
  }

  first<TDefault>(defaultValue: TDefault): Promise<T | TDefault>;

  first(): Promise<T>;

  first(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(firstAsync, ...args);
  }

  last<TDefault>(defaultValue: TDefault): Promise<T | TDefault>;

  last(): Promise<T>;

  last(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(lastAsync, ...args);
  }
}
