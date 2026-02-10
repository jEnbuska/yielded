import { assertIsValidParallel } from "../../general/utils/parallel.ts";
import type { IYieldedParallelGenerator } from "../../generators/parallel/types.ts";
import type { ISharedYieldedResolver } from "../types.ts";

type ResolveCallback<TReturn> = (value: TReturn) => void;

type OnNext<T, TReturn> = (
  value: T,
  resolve: ResolveCallback<TReturn>,
) => unknown;

type OnDone<TReturn> = (resolve: ResolveCallback<TReturn>) => unknown;

export type IParallelResolverName =
  | keyof ISharedYieldedResolver<any, "parallel">
  | "_test";

type IParallelResolversArguments<T, TReturn> = {
  generator: IYieldedParallelGenerator<T>;
  parallel: number;
  onNext?: OnNext<T, TReturn>;
  onDone?: OnDone<TReturn>;
  signal?: AbortSignal;
  name: IParallelResolverName;
};

export type IParallelResolverSubConfig<T, TReturn> = Pick<
  IParallelResolversArguments<T, TReturn>,
  "onNext" | "onDone" | "name"
>;

type ParallelGeneratorResolverState =
  | "running"
  | "depleted"
  | "resolved"
  | "rejected";

export class ParallelGeneratorResolver<T, TReturn> {
  readonly #parallel: number;

  readonly #generator: IYieldedParallelGenerator<T>;

  readonly #onNext?: OnNext<T, TReturn>;

  readonly #onDone?: OnDone<TReturn>;

  readonly #resolvable = Promise.withResolvers<TReturn>();

  #onNextResolvable = Promise.withResolvers<void>();

  #state: ParallelGeneratorResolverState = "running";

  #running = 0;

  readonly #name: IParallelResolverName;

  private constructor(
    name: IParallelResolverName,
    generator: IYieldedParallelGenerator<T>,
    parallel: number,
    onNext?: OnNext<T, TReturn>,
    onDone?: OnDone<TReturn>,
    signal?: AbortSignal,
  ) {
    assertIsValidParallel(parallel);
    this.#parallel = parallel;
    this.#generator = generator;
    this.#onNext = onNext;
    this.#onDone = onDone;
    this.#name = name;
    signal?.addEventListener("abort", () => {
      onDone?.(this.#resolve);
      this.#state = "resolved";
    });
    if (signal?.aborted) {
      this.#state = "depleted";
    }
  }

  #reject = (error: any) => {
    if (this.#state !== "running" && this.#state !== "depleted") return;
    console.warn(this.#name, "rejected", error);
    this.#state = "rejected";
    this.#resolvable.reject(error);
    void this.#generator.return();
    this.#onNextResolvable.resolve();
  };

  #resolve = async (value: TReturn | PromiseLike<TReturn>) => {
    if (this.#state !== "running" && this.#state !== "depleted") return;
    this.#state = "resolved";
    void this.#generator.return();
    this.#resolvable.resolve(value);
  };

  protected dispose() {
    this.#state = "rejected";
  }

  static run<T, TReturn = T>(
    options: IParallelResolversArguments<T, TReturn>,
  ): Disposable & Promise<TReturn> {
    const { generator, parallel, onNext, onDone, signal, name } = options;
    const resolver = new ParallelGeneratorResolver<T, TReturn>(
      name,
      generator,
      parallel,
      onNext,
      onDone,
      signal,
    );
    return Object.assign(resolver.run(), {
      [Symbol.dispose]() {
        resolver.dispose();
      },
    });
  }

  protected async run(): Promise<TReturn> {
    try {
      while (this.#state === "running") {
        this.#running++;
        this.#onNextResolvable = Promise.withResolvers<void>();
        void this.#generator.next().then(this.#handleNext).catch(this.#reject);
        if (this.#running < this.#parallel) continue;
        await this.#onNextResolvable.promise;
        this.#onNextResolvable = Promise.withResolvers<void>();
      }
      while (this.#state === "depleted") {
        if (!this.#running) {
          await Promise.resolve(this.#onDone?.(this.#resolve)).catch(
            this.#reject,
          );
          this.#state = "resolved";
        } else {
          await this.#onNextResolvable.promise;
          this.#onNextResolvable = Promise.withResolvers<void>();
        }
      }
    } catch (error) {
      this.#reject(error);
    }
    return this.#resolvable.promise;
  }

  #handleNext = async (result: IteratorResult<T, void>) => {
    if (result.done) {
      this.#state = "depleted";
    } else {
      await this.#onNext?.(result.value, this.#resolve);
    }
    this.#running--;
    this.#onNextResolvable.resolve();
  };
}
