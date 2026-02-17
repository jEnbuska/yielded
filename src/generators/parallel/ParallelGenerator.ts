import type { IYieldedFlow } from "../../general/types.ts";
import { createResolvable } from "../../general/utils/createResolvable.ts";
import {
  assertIsValidParallel,
  throttle,
} from "../../general/utils/parallel.ts";
import type { IYieldedGenerator } from "../types.ts";
import { ParallelAbortError } from "./ParallelAbortError.ts";
import type {
  IParallelGeneratorName,
  IParallelGeneratorOnDone,
  IParallelGeneratorOnNext,
  IParallelGeneratorState,
  IYieldedParallelGenerator,
  OnNextGenerator,
  OnNextIterable,
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

  #pendingWork: Promise<any>[] = [];

  #pendingDraining: Promise<any>[] = [];

  #doneResolvable: PromiseWithResolvers<void> & { resolved?: boolean } =
    createResolvable();

  readonly #parallel: number;

  readonly #buffer: Array<OnNextGenerator<TOut>> = [];

  readonly #generator: IYieldedParallelGenerator<T>;

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
      onNext = ParallelGenerator.#defaultOnNext<TOut>,
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

  static async *#defaultOnNext<T>(next: Promise<T> | T): OnNextIterable<T> {
    yield next;
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
      void this.#drainBuffered()
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
    const resolve = this.#registerHandleNext();
    try {
      while (true) {
        const buffered = await this.#getNextFromBuffer();
        if (!buffered?.done) return buffered;
        if (this.#getState() !== "running") return this.#handleDone(resolve);
        const next = await this.#generator.next();

        if (next.done) return this.#handleDone(resolve);
        if (this.#getState() === "aborted") return returnResult;
        const generator = this.#onNext(next.value);
        const nextProvided = await generator.next();
        if (this.#getState() === "aborted") return returnResult;
        if (!nextProvided.done) {
          this.#buffer.push(generator);
          return nextProvided;
        }
        if (nextProvided.value === "STOP") {
          void this.#generator.return?.();
          return this.#handleDone(resolve);
        }
        if (this.#getState() === "done") {
          return this.#handleDone(resolve);
        }
      }
    } finally {
      resolve();
    }
  }

  #registerHandleNext() {
    const { resolve, promise } = createResolvable();
    const pendingWork = this.#pendingWork;
    pendingWork.push(promise);
    return function () {
      const index = pendingWork.indexOf(promise);
      void pendingWork.splice(index, 1);
      resolve();
    };
  }

  async #handleDone(resolve: () => void) {
    if (this.#getState() === "aborted") return returnResult;
    resolve();
    if (this.#getState() === "running") {
      this.#setState("done");
      while (this.#pendingWork.length) await Promise.all(this.#pendingWork);
      if (this.#onDone) {
        const iterable = this.#onDone();
        this.#buffer.push(iterable);
      }
      this.#doneResolvable.resolve();
      this.#doneResolvable.resolved = true;
    }
    return this.#drainBuffered();
  }

  async #getNextFromBuffer() {
    while (this.#buffer.length && this.#state !== "aborted") {
      const iterable = this.#buffer.shift()!;
      const next = await iterable.next();
      if (this.#getState() === "aborted") break;
      if (next.done) continue;
      this.#buffer.push(iterable);
      return next;
    }
    return returnResult;
  }

  static #asNotStopIteratorReturnResult<T>(
    result: IteratorResult<T, void | "STOP">,
  ): IteratorResult<T, void> {
    if (result.done) {
      if (result.value === undefined) return result as IteratorResult<T, void>;
      throw new Error(
        "Value can only be returned from generator's when nothing is yielded",
      );
    }
    return result;
  }

  async #drainBuffered(): Promise<IteratorResult<TOut, void>> {
    while (true) {
      if (this.#getState() === "aborted") return returnResult;
      if (!this.#buffer.length) {
        const promisesToRace: Array<Promise<any>> = [];
        if (!this.#doneResolvable.resolved) {
          promisesToRace.push(this.#doneResolvable.promise);
        }
        promisesToRace.push(...this.#pendingWork);
        promisesToRace.push(...this.#pendingDraining);
        if (!promisesToRace.length) return returnResult;
        await Promise.race(promisesToRace);
      } else {
        const resolve = this.#registerDrainBuffer();
        let next: IteratorResult<TOut, void> = returnResult;
        while (this.#buffer.length && this.#getState() !== "aborted") {
          const iterable = this.#buffer.shift()!;
          next = ParallelGenerator.#asNotStopIteratorReturnResult(
            await iterable.next(),
          );
          if (next.done) continue;
          this.#buffer.unshift(iterable);
          break;
        }
        resolve();
        if (!next.done) return next;
      }
    }
  }

  #registerDrainBuffer() {
    const { resolve, promise } = createResolvable();
    const pendingDraining = this.#pendingDraining;
    pendingDraining.push(promise);
    return function () {
      const index = pendingDraining.indexOf(promise);
      void pendingDraining.splice(index, 1);
      resolve();
    };
  }
}
