import type { IDisposableParent } from "../generators/types.ts";

export class ResolversDisposableParent<
  T extends IteratorObject<any> | AsyncGenerator<any>,
> {
  protected readonly generator: Disposable & T;

  protected readonly parent: IDisposableParent;

  protected readonly signal?: AbortSignal;

  constructor(parent: IDisposableParent, generator: T, signal?: AbortSignal) {
    this.parent = parent;
    this.signal = signal;
    this.generator = Object.assign(generator, {
      [Symbol.dispose]() {
        void parent?.[Symbol.dispose]();
      },
    });
    if (signal?.aborted) {
      void generator.return?.(undefined);
      void parent?.[Symbol.dispose]();
    } else {
      signal?.addEventListener("abort", () => {
        void this.parent?.return?.(undefined);
        this.generator[Symbol.dispose]();
      });
    }
  }
}
