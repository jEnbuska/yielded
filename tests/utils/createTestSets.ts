import { expect } from "vitest";
import { Yielded } from "../../src/index.ts";
import { delay } from "./delay.ts";

export type TestSetMode =
  | "sync"
  | `async${string}`
  | `${string}parallel${string}`;

const createAwaitedDelayed = <T>(array: T[]) =>
  Yielded.from(array)
    .awaited()
    .map((it) => delay(it, 1));
const createAwaited = <T>(array: T[]) => Yielded.from(array).awaited();
const createParallel = <T>(array: T[]) => Yielded.from(array).parallel(2);
const createParallelDelayed = <T>(array: T[]) =>
  Yielded.from(array)
    .parallel(3)
    .map((it) => delay(it, 1));
const createMixedParallel = <T>(array: T[]) =>
  Yielded.from(array)
    .map((it) => Promise.resolve(it))
    .awaited()
    .map((it) => it)
    .parallel(3)
    .map((it) => delay(it, 1));

const createParallel50 = <T>(array: T[]) =>
  Yielded.from(array)
    .map((it) => Promise.resolve(it))
    .parallel(50)
    .map((it) => delay(it, 1));
export function createTestSets<T>(array: T[]) {
  const awaitedDelayed = createAwaitedDelayed(array);
  const awaited = createAwaited(array);
  const sync = Yielded.from(array);
  const parallel = createParallel(array);
  const parallelDelayed = createParallelDelayed(array);
  const mixedParallel = createMixedParallel(array);
  const parallel50 = createParallel50(array);

  const nonOrdered = [
    { mode: "parallel", yielded: parallel },
    { mode: "parallel delayed", yielded: parallelDelayed },
    { mode: "mixed parallel", yielded: mixedParallel },
    { mode: "parallel 50", yielded: parallel50 },
  ] as const;
  const awaitedOrderedModes = [
    { mode: "async", yielded: awaited },
    { mode: "async delayed", yielded: awaitedDelayed },
  ] as const;
  const allAsyncModes = [
    { mode: "async", yielded: awaited },
    { mode: "async delayed", yielded: awaitedDelayed },
    ...nonOrdered,
  ] as const;
  const orderedModes = [
    { mode: "sync", yielded: sync },
    ...awaitedOrderedModes,
  ] as const;
  const modes = [...nonOrdered, ...orderedModes] as const;
  return {
    sync,
    awaited,
    awaitedDelayed,
    parallel,
    parallelDelayed,
    mixedParallel,
    empty: Yielded.from<T>([]),
    fromArray: Yielded.from(array),
    fromPromises: Yielded.from(array).map((next) => Promise.resolve(next)),
    fromResolvedPromises: Yielded.from(array)
      .map((next) => Promise.resolve(next))
      .awaited()
      .map((next) => Promise.resolve(next)),
    orderedModes,
    modes,
    nonOrdered,
    allAsyncModes,
  };
}
const asyncMode = { mode: "async", create: createAwaited };
const asyncDelayedMode = {
  mode: "async delayed",
  create: createAwaitedDelayed,
};
const parallelMode = { mode: "parallel", create: createParallel };
const parallelDelayedMode = {
  mode: "parallel delayed",
  create: createParallelDelayed,
};
const mixedParallelMode = {
  mode: "mixed parallel",
  create: createMixedParallel,
};
const parallel50Mode = {
  mode: "parallel 50",
  create: createParallel50,
};
export const asyncModeCreations = [
  asyncMode,
  asyncDelayedMode,
  parallelMode,
  parallelDelayedMode,
  mixedParallelMode,
  parallel50Mode,
] as const;

export async function handleExpect<T>(
  mode: TestSetMode,
  result: Array<Promise<T> | T>,
  expected: T[],
) {
  let _expected = expected;
  switch (mode) {
    case "sync":
      result = await Promise.all(result);
      break;
    case "parallel":
    case "parallel delayed":
    case "mixed parallel":
    case "parallel 50":
      result = result.toSorted();
      _expected = expected.toSorted();
      break;
  }
  expect(result).toStrictEqual(_expected);
}
