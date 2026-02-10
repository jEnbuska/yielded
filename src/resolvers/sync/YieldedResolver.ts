import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import type { IDisposableParent } from "../../generators/types.ts";
import { consumeSync } from "../apply/consume.ts";
import { countSync } from "../apply/count.ts";
import { firstSync } from "../apply/first.ts";
import { groupBySync } from "../apply/groupBy.ts";
import { lastSync } from "../apply/last.ts";
import { maxBySync } from "../apply/maxBy.ts";
import { minBySync } from "../apply/minBy.ts";
import { sumBySync } from "../apply/sumBy.ts";
import { toReversedSync } from "../apply/toReversed.ts";
import { toSortedSync } from "../apply/toSorted.ts";
import { ResolversDisposableParent } from "../ResolversDisposableParent.ts";
import type { IYieldedResolver } from "./types.ts";

export class YieldedResolver<T>
  extends ResolversDisposableParent<IYieldedSyncGenerator<T>>
  implements IYieldedResolver<T>, Iterable<T>
{
  protected constructor(
    parent: IDisposableParent,
    generator: IYieldedSyncGenerator<T>,
    signal?: AbortSignal,
  ) {
    super(parent, generator, signal);
  }

  *[Symbol.iterator]() {
    using generator = this.generator;
    for (const next of generator) {
      yield next;
    }
  }

  #apply<TArgs extends any[], TReturn>(
    cb: (...args: [IYieldedSyncGenerator<T>, ...TArgs]) => TReturn,
    ...args: TArgs
  ): TReturn {
    using generator = this.generator;
    return cb(generator, ...args);
  }

  forEach(
    ...args: Parameters<IYieldedResolver<T>["forEach"]>
  ): ReturnType<IYieldedResolver<T>["forEach"]> {
    return this.generator.forEach(...args);
  }

  reduce<TOut>(
    reducer: (acc: TOut, next: T, index: number) => TOut,
    initialValue: TOut,
  ): TOut;

  reduce(reducer: (acc: T, next: T, index: number) => T): T;

  reduce(...args: Parameters<IYieldedResolver<T>["reduce"]>) {
    using generator = this.generator;
    return generator.reduce(...args);
  }

  toArray() {
    using generator = this.generator;
    return generator.toArray();
  }

  toSet() {
    using generator = this.generator;
    return new Set(generator);
  }

  find<TOut extends T>(predicate: (next: T) => next is TOut): TOut | undefined;

  find(predicate: (next: T) => unknown): T | undefined;

  find(...args: Parameters<IYieldedResolver<T>["find"]>) {
    using generator = this.generator;
    return generator.find(...args);
  }

  some(...args: Parameters<IYieldedResolver<T>["some"]>) {
    using generator = this.generator;
    return generator.some(...args);
  }

  every(...args: Parameters<IYieldedResolver<T>["every"]>) {
    using generator = this.generator;
    return generator.every(...args);
  }

  toSorted(...args: Parameters<IYieldedResolver<T>["toSorted"]>) {
    return this.#apply(toSortedSync, ...args);
  }

  toReversed() {
    return this.#apply(toReversedSync);
  }

  minBy(selector: (next: T, index: number) => number): T;

  minBy<TDefault>(
    selector: (next: T, index: number) => number,
    defaultValue: TDefault,
  ): T | TDefault;

  minBy(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(minBySync, ...args);
  }

  maxBy(selector: (next: T, index: number) => number): T;

  maxBy<TDefault>(
    selector: (next: T, index: number) => number,
    defaultValue: TDefault,
  ): T | TDefault;

  maxBy(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(maxBySync, ...args);
  }

  sumBy(...args: Parameters<IYieldedResolver<T>["sumBy"]>) {
    return this.#apply(sumBySync, ...args);
  }

  count(...args: Parameters<IYieldedResolver<T>["count"]>) {
    return this.#apply(countSync, ...args);
  }

  groupBy<TKey extends PropertyKey, const TGroups extends PropertyKey>(
    keySelector: (next: T) => TKey,
    groups: TGroups[],
  ): Record<TGroups, T[]> & Partial<Record<Exclude<TKey, TGroups>, T[]>>;

  groupBy<TKey extends PropertyKey>(
    keySelector: (next: T) => TKey,
    groups?: undefined,
  ): Partial<Record<TKey, T[]>>;

  groupBy(...args: unknown[]): any {
    // @ts-expect-error
    return this.#apply(groupBySync, ...args);
  }

  consume() {
    return this.#apply(consumeSync);
  }

  first<TDefault>(defaultValue: TDefault): T | TDefault;

  first(): T;

  first(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(firstSync, ...args);
  }

  last<TDefault>(defaultValue: TDefault): T | TDefault;

  last(): T;

  last(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(lastSync, ...args);
  }
}
