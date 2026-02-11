import {
  getEmptySlot,
  isEmptySlot,
} from "../../resolvers/apply/utils/emptySlot.ts";
import { Yielded } from "../../sync/Yielded.ts";
import { hasNative } from "./hasNative.ts";

export function createResolvable<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  if (hasNative(Promise, "withResolvers") && !Yielded.__USE_POLYFILL_ONLY__) {
    return Promise.withResolvers<T>();
  }
  return new PolyfillPromiseWithResolvers<T>();
}

export class PolyfillPromiseWithResolvers<T> {
  promise: Promise<T>;

  #resolver?: (value: T | PromiseLike<T>) => void;

  #rejecter?: (reason?: any) => void;

  #resolved: symbol | T | PromiseLike<T> = getEmptySlot();

  #rejected: any = getEmptySlot();

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      if (!isEmptySlot(this.#resolved)) return resolve(this.#resolved);
      if (!isEmptySlot(this.#rejected)) return reject(this.#rejected);
      this.#resolver = resolve;
      this.#rejecter = reject;
    });
  }

  resolve = (value: T | PromiseLike<T>) => {
    if (this.#resolver) this.#resolver(value);
    else this.#resolved = value;
  };

  reject = (e: any) => {
    if (this.#rejecter) this.#rejecter(e);
    else this.#rejected = e;
  };
}
