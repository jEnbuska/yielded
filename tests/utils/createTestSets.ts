import { expect } from "vitest";
import { Yielded } from "../../src/index.ts";
import { delay } from "./delay.ts";

export type TestSetMode =
  | "sync"
  | `async${string}`
  | `${string}parallel${string}`;

export function createTestSets<T>(array: T[]) {
  const awaitedDelayed = Yielded.from(array)
    .awaited()
    .map((it) => delay(it, 1));
  const awaited = Yielded.from(array).awaited();
  const sync = Yielded.from(array);
  const parallel = Yielded.from(array).parallel(2);
  const parallelDelayed = Yielded.from(array)
    .parallel(3)
    .map((it) => delay(it, 1));
  const mixedParallel = Yielded.from(array)
    .map((it) => Promise.resolve(it))
    .awaited()
    .map((it) => it)
    .parallel(3)
    .map((it) => delay(it, 1));

  const parallel50 = Yielded.from(array)
    .map((it) => Promise.resolve(it))
    .parallel(50)
    .map((it) => delay(it, 1));

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
