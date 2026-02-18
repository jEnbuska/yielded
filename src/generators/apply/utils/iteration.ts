import type { IYieldedIterableSource } from "../../../general/types.ts";

export function isAsyncIterableProvider<T>(
  value: unknown,
): value is IYieldedIterableSource<T, "async"> {
  return isIterableProvider(value) || isAsyncIterable(value);
}

export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  return (
    Boolean(value) &&
    typeof (value as AsyncIterable<any>)[Symbol.asyncIterator] === "function"
  );
}

export function isIterable<T>(value: unknown): value is Iterable<T> {
  return (
    Boolean(value) &&
    typeof (value as Iterable<any>)[Symbol.iterator] === "function"
  );
}

export function asyncIterableProviderToAsyncIterable<T>(
  value: IYieldedIterableSource<T, "async">,
): AsyncIterable<T> | Iterable<T> {
  if (isAsyncIterable<T>(value)) {
    return value;
  }
  if (isIterable<T>(value)) {
    return value;
  }
  return {
    [Symbol.asyncIterator](): AsyncIterator<T> {
      return {
        async next(): Promise<IteratorResult<T>> {
          return (value as any).next();
        },
      };
    },
  };
}
export function isIterableProvider<T>(
  value: unknown,
): value is IYieldedIterableSource<T, "sync"> {
  if (!value || typeof value !== "object") return false;
  if ("next" in value && typeof (value as any).next === "function") return true;
  return typeof (value as Iterable<any>)[Symbol.iterator] === "function";
}

export function iterableProviderToIterable<T>(
  value: IYieldedIterableSource<T, "sync">,
): Iterable<T> {
  if (typeof (value as Iterable<any>)[Symbol.iterator] === "function") {
    return value as Iterable<T>;
  }
  return {
    [Symbol.iterator]() {
      return {
        next(): IteratorResult<T> {
          return (value as any).next() as any;
        },
      };
    },
  };
}
