import type { IYieldedSyncGenerator } from "../../generators/sync/types.ts";
import type { IDisposableParent } from "../../generators/types.ts";
import { consumeSync } from "../apply/consume.ts";
import { countSync } from "../apply/count.ts";
import { everySync } from "../apply/every.ts";
import { findSync } from "../apply/find.ts";
import { firstSync } from "../apply/first.ts";
import { forEachSync } from "../apply/forEach.ts";
import { groupBySync } from "../apply/groupBy.ts";
import { lastSync } from "../apply/last.ts";
import { maxBySync } from "../apply/maxBy.ts";
import { minBySync } from "../apply/minBy.ts";
import { reduceAsync } from "../apply/reduce.ts";
import someSync from "../apply/some.ts";
import { sumBySync } from "../apply/sumBy.ts";
import { toArraySync } from "../apply/toArray.ts";
import { toReversedSync } from "../apply/toReversed.ts";
import { toSetSync } from "../apply/toSet.ts";
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
    try {
      for (const next of this.generator) {
        yield next;
      }
    } finally {
      this.generator[Symbol.dispose]();
    }
  }

  [Symbol.dispose]() {
    this.generator[Symbol.dispose]?.();
  }

  next(): IteratorResult<T, void | undefined> {
    return this.generator.next();
  }

  return(): IteratorResult<T, void | undefined> {
    return this.generator.return?.()!;
  }

  throw(e: any): IteratorResult<T, void | undefined> {
    return this.generator.throw?.(e)!;
  }

  #apply<TArgs extends any[], TReturn>(
    cb: (...args: [IYieldedSyncGenerator<T>, ...TArgs]) => TReturn,
    ...args: TArgs
  ): TReturn {
    try {
      return cb(this.generator, ...args);
    } finally {
      this.generator[Symbol.dispose]();
    }
  }

  forEach(
    ...args: Parameters<IYieldedResolver<T>["forEach"]>
  ): ReturnType<IYieldedResolver<T>["forEach"]> {
    this.#apply(forEachSync, ...args);
  }

  reduce<TOut>(
    reducer: (acc: TOut, next: T, index: number) => TOut,
    initialValue: TOut,
  ): TOut;

  // @ts-ignore
  reduce(reducer: (acc: T, next: T, index: number) => T): T;

  reduce(...args: unknown[]) {
    // @ts-expect-error
    return this.#apply(reduceAsync, ...args);
  }

  toArray() {
    return this.#apply(toArraySync);
  }

  toSet() {
    return this.#apply(toSetSync);
  }

  find<TOut extends T>(predicate: (next: T) => next is TOut): TOut | undefined;

  find(predicate: (next: T) => unknown): T | undefined;

  find(...args: unknown[]) {
    // @ts-ignore
    return this.#apply(findSync, ...args);
  }

  some(...args: Parameters<IYieldedResolver<T>["some"]>) {
    return this.#apply(someSync, ...args);
  }

  every(...args: Parameters<IYieldedResolver<T>["every"]>) {
    return this.#apply(everySync, ...args);
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
