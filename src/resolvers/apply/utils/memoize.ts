import { getEmptySlot } from "./emptySlot.ts";

/**
 * Creates a memoized version of the given function that caches the result
 * of the **most recent invocation** and returns the cached result when
 * the function is called again with the same arguments (using strict === comparison).
 *
 * Only the **last call’s arguments and result** are cached. If the next call
 * receives arguments that are shallowly equal (same values in same order),
 * the previously returned value is returned without re-executing `cb`.
 *
 * This simple memoization is useful for functions that are called repeatedly
 * with the same arguments and are expensive to compute.
 *
 * @example
 * ```ts
 * let count = 0;
 * const add = memoize((a: number, b: number) => {
 *   count++;
 *   return a + b;
 * });
 *
 * add(1, 2); // returns 3, count === 1
 * add(1, 2); // returns cached 3, count still 1
 * add(2, 3); // returns 5, count === 2
 * add(2, 3); // returns cached 5, count still 2
 * ``
 * */
export function memoize<TArgs extends any[], TReturn>(
  cb: (...args: TArgs) => TReturn,
) {
  let prevArgs: TArgs = [getEmptySlot()] as unknown as any;
  let prevReturn: TReturn;
  return function memoizedFunction(...args: TArgs): TReturn {
    let allSame = prevArgs.length === args.length;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === prevArgs[i]) continue;
      allSame = false;
      break;
    }
    if (allSame) {
      return prevReturn;
    }
    prevArgs = args;
    prevReturn = cb(...args);
    return prevReturn;
  };
}
