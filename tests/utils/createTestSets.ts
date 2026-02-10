import { Yielded } from "../../src/index.ts";
import { delay } from "./delay.ts";

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
    orderedModes: [
      { mode: "sync", yielded: sync },
      { mode: "async", yielded: awaited },
      { mode: "async delayed", yielded: awaitedDelayed },
    ] as const,
    modes: [
      { mode: "sync", yielded: sync },
      { mode: "async", yielded: awaited },
      { mode: "async delayed", yielded: awaitedDelayed },
      { mode: "parallel", yielded: parallel },
      { mode: "parallel delayed", yielded: parallelDelayed },
      { mode: "mixed parallel", yielded: mixedParallel },
    ],
  };
}
