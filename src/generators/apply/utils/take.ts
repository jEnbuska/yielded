import type { IYieldedParallelGenerator } from "../../parallel/types.ts";

export function assertNotNegative(count: number): asserts count is number {
  if (count < 0) throw new RangeError(`${count} must be positive`);
}

export function assertIsNotZero(count: number): asserts count is number {
  if (count === 0) throw new RangeError(`${count} cant be zero`);
}

const emptyAsyncGenerator: AsyncGenerator<any> = (async function* () {})();
export function getEmptyAsyncGenerator<T>(): IYieldedParallelGenerator<T> {
  return emptyAsyncGenerator;
}
