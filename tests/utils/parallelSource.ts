import type { IYieldedParallelGenerator } from "../../src/generators/parallel/types.ts";
import { MockIYieldedParallelGenerator } from "./MockGenerators.ts";

export function parallelSource(
  count: number,
): IYieldedParallelGenerator<number> {
  const numbers = [];
  for (let i = 1; i <= count; i++) {
    numbers.push(i);
  }
  return MockIYieldedParallelGenerator(numbers);
}
