import type {
  IMaybeAsync,
  IYieldedIterableSource,
} from "../../general/types.ts";
import type { IYieldedGenerator } from "../../generators/types.ts";

function parallelIterableProviderToAsyncIterable<TOut>(
  value: IYieldedIterableSource<TOut, "parallel">,
): AsyncIterator<IMaybeAsync<TOut>> | Iterator<IMaybeAsync<TOut>> {
  if ("next" in value && typeof (value as any).next === "function") {
    return value as AsyncIterator<TOut> | Iterator<TOut>;
  }
  if (
    typeof (value as AsyncIterable<TOut>)[Symbol.asyncIterator] === "function"
  ) {
    return (value as any)[Symbol.asyncIterator]() as AsyncIterator<TOut>;
  }
  if (typeof (value as Iterable<TOut>)[Symbol.iterator] === "function") {
    return (value as any)[Symbol.iterator]() as Iterator<TOut>;
  }
  throw new Error("Invalid IYieldedIterableSource parallel source");
}

export class ParallelBufferGenerator<T> implements IYieldedGenerator<
  T,
  "async"
> {
  #iterator: AsyncIterator<IMaybeAsync<T>> | Iterator<IMaybeAsync<T>>;

  constructor(source: IYieldedIterableSource<T, "parallel">) {
    this.#iterator = parallelIterableProviderToAsyncIterable<T>(source);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async [Symbol.asyncDispose]() {}

  async return(): Promise<IteratorResult<T, undefined | void>> {
    return { done: true, value: undefined };
  }

  async throw(): Promise<IteratorResult<T, undefined | void>> {
    return { done: true, value: undefined };
  }

  async next(): Promise<IteratorResult<T, void | undefined>> {
    const result = await this.#iterator.next();
    if (result.done) {
      return result;
    }
    return { done: false, value: await result.value };
  }
}
