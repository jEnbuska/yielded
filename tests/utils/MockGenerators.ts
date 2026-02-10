import type { VitestUtils } from "vitest";
import type { IYieldedParallelGenerator } from "../../src/generators/parallel/types.ts";
import { delay } from "./delay.ts";

export function MockIYieldedParallelGenerator<T>([...values]: Array<
  Promise<T> | T
>): IYieldedParallelGenerator<T> & Disposable {
  let disposed = false;
  return Object.assign(
    {
      [Symbol.asyncIterator]() {
        return this as any;
      },

      async [Symbol.asyncDispose]() {
        disposed = true;
      },
      async next(): Promise<IteratorResult<T, void>> {
        if (disposed || !values.length) {
          return { done: true, value: undefined } as const;
        }
        const value = await values.shift()!;
        return { value, done: false };
      },

      async return() {
        disposed = true;
        return { done: true, value: undefined } as const;
      },

      async throw() {
        disposed = true;
        return { done: true, value: undefined } as const;
      },
    },
    {
      [Symbol.dispose]() {
        disposed = true;
      },
    },
  );
}

export function MockDelayedValuesGenerator<T>(
  utils: VitestUtils,
  values: Array<[delayMs: number, T]>,
): IYieldedParallelGenerator<T> & Disposable {
  let disposed = false;
  return Object.assign(
    {
      [Symbol.asyncIterator]() {
        return this as any;
      },

      async [Symbol.asyncDispose]() {
        disposed = true;
      },
      async next(): Promise<IteratorResult<T, void>> {
        if (disposed || !values.length) {
          return { done: true, value: undefined } as const;
        }
        const [delayMs, next] = values.shift()!;

        const promise = delay(next, delayMs);
        void utils.advanceTimersToNextTimerAsync();
        const value = await promise;
        return { value, done: false as const };
      },

      async return() {
        disposed = true;
        return { done: true, value: undefined } as const;
      },

      async throw() {
        disposed = true;
        return { done: true, value: undefined } as const;
      },
    },
    {
      [Symbol.dispose]() {
        disposed = true;
      },
    },
  );
}
