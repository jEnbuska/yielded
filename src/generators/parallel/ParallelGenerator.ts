import type { IYieldedFlow } from "../../general/types.ts";
import { createResolvable } from "../../general/utils/createResolvable.ts";
import {
  assertIsValidParallel,
  throttle,
} from "../../general/utils/parallel.ts";
import { ParallelBufferGenerator } from "../../resolvers/parallel/ParallelBufferGenerator.ts";
import type { IYieldedGenerator } from "../types.ts";
import { ParallelAbortError } from "./ParallelAbortError.ts";
import type {
  IParallelGeneratorName,
  IParallelGeneratorOnDone,
  IParallelGeneratorOnNext,
  IParallelGeneratorState,
  IYieldedParallelGenerator,
} from "./types.ts";

const returnResult: IteratorReturnResult<void | undefined> = {
  done: true,
  value: undefined,
};

export class ParallelGenerator<
  T,
  TOut,
> implements IYieldedParallelGenerator<TOut> {
  #state: IParallelGeneratorState = "running";

  readonly #name: IParallelGeneratorName;

  #error?: any;

  readonly #onNext: IParallelGeneratorOnNext<T, TOut>;

  readonly #onDone?: IParallelGeneratorOnDone<TOut>;

  #queue: Array<PromiseWithResolvers<IteratorResult<TOut, void>>> = [];

  #pendingWork = new Set<any>();

  #doneResolvable: PromiseWithResolvers<void> & { resolved?: boolean } =
    createResolvable();

  readonly #parallel: number;

  readonly #buffer: Array<IYieldedGenerator<TOut, "async">> = [];

  readonly #generator: IYieldedParallelGenerator<T>;

  #drainers = 0;

  #drainResolvable = createResolvable<void>();

  static create<T, TOut = T>(options: {
    name: IParallelGeneratorName;
    generator: IYieldedGenerator<T, IYieldedFlow>;
    onNext?: IParallelGeneratorOnNext<T, TOut>;
    onDone?: IParallelGeneratorOnDone<TOut>;
    parallel: number;
  }): IYieldedParallelGenerator<TOut> {
    const {
      generator,
      parallel,
      onNext = ParallelGenerator.#defaultOnNext,
      onDone,
      name,
    } = options as any;
    return new ParallelGenerator<T, TOut>(
      name,
      generator,
      parallel,
      onNext,
      onDone,
    );
  }

  static #defaultOnNext(value: Promise<unknown>) {
    return [value];
  }

  private constructor(
    name: IParallelGeneratorName,
    generator: IYieldedParallelGenerator<T>,
    parallel: number,
    onNext: IParallelGeneratorOnNext<T, TOut>,
    onDone?: IParallelGeneratorOnDone<TOut>,
  ) {
    assertIsValidParallel(parallel);
    this.#generator = generator;
    this.#onNext = onNext;
    this.#onDone = onDone;
    this.#parallel = parallel;
    this.#name = name;
    this.next = throttle(this.#parallel, this.next.bind(this));
  }

  // ---------------- AsyncGenerator ----------------

  [Symbol.asyncIterator]() {
    return this;
  }

  async [Symbol.asyncDispose]() {
    this.#setState("aborted");
  }

  async return(): Promise<IteratorReturnResult<void | undefined>> {
    this.#setState("aborted");
    return returnResult;
  }

  async throw(err: unknown): Promise<IteratorReturnResult<void | undefined>> {
    console.warn(this.#name, "THROWN", err);
    this.#setState("aborted");
    throw err;
  }

  #setState(state: IParallelGeneratorState) {
    switch (state) {
      case "running":
        throw new Error('Cannot transition to "running" state');
      case "done": {
        this.#state = state;
        return;
      }
      case "aborted": {
        if (this.#state === "aborted") return;
        this.#state = state;
        void this.#generator.return?.();
        for (const next of this.#queue) {
          if (this.#error) {
            next.reject(this.#error);
          } else {
            next.resolve(returnResult);
          }
        }
        this.#buffer.length = 0;
        break;
      }
      default:
        throw new Error("Invalid state transition to " + state);
    }
  }

  #getState() {
    return this.#state;
  }

  async next(): Promise<IteratorResult<TOut, void>> {
    if (this.#error) throw this.#error;

    if (this.#state === "aborted") return returnResult;

    const resolvable = createResolvable<IteratorResult<TOut, void>>();
    this.#queue.push(resolvable);
    if (this.#state === "done") {
      void this.#drainLastFromBuffered()
        .then(this.#onHandleNextResolved)
        .catch(this.#handleError);
    } else {
      void this.#handleNext()
        .then(this.#onHandleNextResolved)
        .catch(this.#handleError);
    }
    return resolvable.promise;
  }

  // ---------------- Internal ----------------

  #onHandleNextResolved = (result: IteratorResult<TOut, void>) => {
    const resolvable = this.#queue.shift();
    resolvable?.resolve(result);
  };

  #handleError = async (error: any) => {
    if (this.#getState() === "aborted") return;
    console.warn(this.#name, error);
    if (error instanceof ParallelAbortError) {
      this.#setState("aborted");
    } else {
      this.#error = error;
      this.#setState("aborted");
    }
  };

  async #handleNext(): Promise<IteratorResult<TOut, void>> {
    while (this.#state !== "aborted") {
      const buffered = await this.#getNextFromBuffer();
      if (buffered) return buffered;
      if (this.#getState() !== "running") return this.#handleDone();
      const next = await this.#registerWork(this.#generator.next());
      if (next.done) {
        return this.#handleDone();
      }
      const result = await this.#registerWork(this.#onNext?.(next.value));
      if (this.#getState() === "aborted") break;
      if (!result) continue;
      if (result === "STOP") {
        void this.#generator.return?.();
        return this.#handleDone();
      }
      const iterable = new ParallelBufferGenerator(result);
      const first = await this.#registerWork(iterable.next());
      if (this.#getState() === "aborted") break;
      if (first.done) continue;
      this.#buffer.push(iterable);
      return first;
    }
    return returnResult;
  }

  async #registerWork<T>(work: Promise<T> | T): Promise<T> {
    const promise = Promise.race([work]);

    this.#pendingWork.add(promise);
    try {
      const result = await promise;
      if (this.#getState() === "aborted") {
        throw new ParallelAbortError("Aborted");
      }
      return result;
    } finally {
      this.#pendingWork.delete(promise);
    }
  }

  async #handleDone() {
    if (this.#getState() === "running") {
      this.#setState("done");
      while (this.#pendingWork.size) await Promise.all(this.#pendingWork);
      const result = await this.#onDone?.();
      if (result) this.#buffer.push(new ParallelBufferGenerator(result));
      this.#doneResolvable.resolve();
      this.#doneResolvable.resolved = true;
    }
    return this.#drainLastFromBuffered();
  }

  async #getNextFromBuffer() {
    while (this.#buffer.length && this.#state !== "aborted") {
      const iterable = this.#buffer.shift()!;
      const next = await iterable.next();
      if (next.done) continue;
      this.#buffer.push(iterable);
      return next;
    }
  }

  async #drainLastFromBuffered(): Promise<IteratorResult<TOut, void>> {
    const wasResolved = this.#doneResolvable.resolved;
    while (
      this.#drainers &&
      !this.#buffer.length &&
      this.#state !== "aborted"
    ) {
      await this.#drainResolvable.promise;
    }
    let next: IteratorResult<TOut, void> = returnResult;
    while (this.#buffer.length && this.#state !== "aborted") {
      const iterable = this.#buffer.shift()!;
      this.#drainers++;
      next = await iterable.next();
      this.#drainers--;
      if (next.done) continue;
      this.#buffer.push(iterable);
      break;
    }
    this.#drainResolvable.resolve();
    this.#drainResolvable = createResolvable<void>();
    if (!next.done || wasResolved) return next;
    await this.#doneResolvable.promise;
    return this.#drainLastFromBuffered();
  }
}
