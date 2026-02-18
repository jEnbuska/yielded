import { expect } from "vitest";
import { delay } from "./delay.ts";

export function createRandomSyncFlattableData(size: number) {
  const acc: Array<number | Array<number> | Generator<number>> = [];
  let i = -1;

  while (i <= size) {
    const n = Math.floor(Math.random() * 14);
    if (n === 0) {
      acc.push(++i);
      continue;
    }
    const first = ++i;
    if (n < 3) {
      switch (n) {
        case 1:
          acc.push(first);
          continue;
        case 2:
          acc.push(
            (function* () {
              yield first;
            })(),
          );
          continue;
      }
    }
    const second = ++i;

    switch (n) {
      case 3:
        acc.push([first, second]);
        continue;
      case 4:
        acc.push(
          (function* () {
            yield first;
            yield second;
          })(),
        );
        continue;
      case 5:
        acc.push(
          (function* () {
            yield* [first, second];
          })(),
        );
        continue;
    }

    const third = ++i;

    switch (n) {
      case 6:
        acc.push(
          (function* () {
            yield first;
            yield* [second, third];
          })(),
        );
        continue;
      case 7:
        acc.push(
          (function* () {
            yield* [first, second];
            yield third;
          })(),
        );
        continue;
      case 8:
        acc.push(
          (function* () {
            yield* [first, second, third];
          })(),
        );
        continue;
      case 9:
        acc.push([first, second, third]);
        continue;
    }
    const fourth = ++i;
    switch (n) {
      case 10:
        acc.push(
          (function* () {
            yield* [first, second];
            yield* [third, fourth];
          })(),
        );
        continue;
      case 11:
        acc.push(
          (function* () {
            yield* [first, second, third];
            yield* [fourth];
          })(),
        );
        continue;
      case 12:
        acc.push(
          (function* () {
            yield* [first, second, third, fourth];
            yield* [];
          })(),
        );
        continue;
      case 13:
        acc.push(
          (function* () {
            yield first;
            yield* [second, third, fourth];
          })(),
        );
        continue;
    }
    throw new Error("Invalid random n value: " + n);
  }
  return acc;
}

export function createRandomAsyncFlattableData(size: number) {
  const acc: Array<
    | Promise<number>
    | number
    | Array<Promise<number> | number>
    | Generator<number | Promise<number>>
    | AsyncGenerator<number | Promise<number>>
  > = [];
  let i = -1;

  while (i <= size) {
    const n = Math.floor(Math.random() * 50);
    if (n === 0) {
      acc.push(++i);
      continue;
    }
    const first = ++i;

    switch (n) {
      case 1:
        acc.push(first);
        continue;
      case 2:
        acc.push(Promise.resolve(first));
        continue;
      case 3:
        acc.push(delay(first, 2));
        continue;
      case 4:
        acc.push(
          (function* () {
            yield first;
          })(),
        );
        continue;
      case 5:
        acc.push(
          (async function* () {
            yield first;
          })(),
        );
        continue;
      case 6:
        acc.push(
          (function* () {
            yield delay(first, 2);
          })(),
        );
        continue;
      case 7:
        acc.push(
          (async function* () {
            yield delay(first, 2);
          })(),
        );
        continue;
      case 8:
        acc.push(
          (function* () {
            yield Promise.resolve(first);
          })(),
        );
        continue;
      case 9:
        acc.push(
          (async function* () {
            yield Promise.resolve(first);
          })(),
        );
        continue;
    }
    const second = ++i;
    if (n < 30) {
      switch (n) {
        case 10:
          acc.push([first, second]);
          continue;
        case 11:
          acc.push([Promise.resolve(first), Promise.resolve(second)]);
          continue;
        case 12:
          acc.push([delay(first, 2), delay(second, 2)]);
          continue;
        case 13:
          acc.push(
            (function* () {
              yield first;
              yield second;
            })(),
          );
          continue;
        case 14:
          acc.push(
            (async function* () {
              yield first;
              yield second;
            })(),
          );
          continue;

        case 15:
          acc.push(
            (function* () {
              yield delay(first, 2);
              yield delay(second, 2);
            })(),
          );
          continue;
        case 16:
          acc.push(
            (function* () {
              yield Promise.resolve(first);
              yield Promise.resolve(second);
            })(),
          );
          continue;
        case 17:
          acc.push(
            (async function* () {
              yield Promise.resolve(first);
              yield Promise.resolve(second);
            })(),
          );
          continue;
        case 18:
          acc.push(
            (function* () {
              yield delay(first, 2);
              yield Promise.resolve(second);
            })(),
          );
          continue;
        case 19:
          acc.push(
            (function* () {
              yield Promise.resolve(first);
              yield delay(second, 2);
            })(),
          );
          continue;
        case 20:
          acc.push(
            (async function* () {
              yield delay(first, 2);
              yield Promise.resolve(second);
            })(),
          );
          continue;
        case 21:
          acc.push(
            (async function* () {
              yield Promise.resolve(first);
              yield delay(second, 2);
            })(),
          );
          continue;
        case 22:
          acc.push(
            (function* () {
              yield* [delay(first, 2), delay(second, 2)];
            })(),
          );
          continue;
        case 23:
          acc.push(
            (async function* () {
              yield* [delay(first, 2), delay(second, 2)];
            })(),
          );
          continue;
        case 24:
          acc.push(
            (function* () {
              yield* [Promise.resolve(first), Promise.resolve(second)];
            })(),
          );
          continue;
        case 25:
          acc.push(
            (async function* () {
              yield* [Promise.resolve(first), Promise.resolve(second)];
            })(),
          );
          continue;
        case 26:
          acc.push(
            (function* () {
              yield* [delay(first, 2), Promise.resolve(second)];
            })(),
          );
          continue;
        case 27:
          acc.push(
            (function* () {
              yield* [Promise.resolve(first), delay(second, 2)];
            })(),
          );
          continue;
        case 28:
          acc.push(
            (async function* () {
              yield* [delay(first, 2), Promise.resolve(second)];
            })(),
          );
          continue;
        case 29:
          acc.push(
            (async function* () {
              yield* [Promise.resolve(first), delay(second, 2)];
            })(),
          );
          continue;
      }
    }
    const third = ++i;

    switch (n) {
      case 30:
        acc.push(
          (function* () {
            yield delay(first, 2);
            yield* [delay(second, 2), delay(third, 2)];
          })(),
        );
        continue;

      case 31:
        acc.push(
          (async function* () {
            yield first;
            yield* [delay(second, 2), delay(third, 2)];
          })(),
        );
        continue;
      case 32:
        acc.push(
          (async function* () {
            yield delay(first, 2);
            yield* [delay(second, 2), third];
          })(),
        );
        continue;
      case 33:
        acc.push(
          (async function* () {
            yield delay(first, 2);
            yield* [second, delay(third, 2)];
          })(),
        );
        continue;
      case 34:
        acc.push(
          (function* () {
            yield* [delay(first, 2), delay(second, 2)];
            yield delay(third, 2);
          })(),
        );
        continue;
      case 35:
        acc.push(
          (function* () {
            yield first;
            yield* [delay(second, 2), third];
          })(),
        );
        continue;
      case 36:
        acc.push(
          (function* () {
            yield first;
            yield* [second, delay(third, 2)];
          })(),
        );
        continue;
      case 37:
        acc.push(
          (async function* () {
            yield delay(first, 2);
            yield* [delay(second, 2), delay(third, 2)];
          })(),
        );
        continue;
      case 38:
        acc.push(
          (function* () {
            yield delay(first, 2);
            yield* [second, delay(third, 2)];
          })(),
        );
        continue;
      case 39:
        acc.push(
          (function* () {
            yield delay(first, 2);
            yield* [delay(second, 2), third];
          })(),
        );
        continue;
      case 40:
        acc.push(
          (function* () {
            yield delay(first, 2);
            yield* [second, third];
          })(),
        );
        continue;
      case 41:
        acc.push(
          (async function* () {
            yield* [delay(first, 2), delay(second, 2)];
            yield third;
          })(),
        );
        continue;

      case 42:
        acc.push(
          (function* () {
            yield* [delay(first, 2), delay(second, 2)];
            yield third;
          })(),
        );
        continue;
      case 43:
        acc.push(
          (async function* () {
            yield delay(first, 2);
            yield* [second, third];
          })(),
        );
        continue;
      case 44:
        acc.push(
          (async function* () {
            yield first;
            yield* [second, delay(third, 2)];
          })(),
        );
        continue;
      case 45:
        acc.push(
          (async function* () {
            yield first;
            yield* [delay(second, 2), third];
          })(),
        );
        continue;
      case 46:
        acc.push(
          (async function* () {
            yield* [delay(first, 2), delay(second, 2)];
            yield delay(third, 2);
          })(),
        );
        continue;
      case 47:
        acc.push(
          (function* () {
            yield first;
            yield* [delay(second, 2), delay(third, 2)];
          })(),
        );
        continue;
    }
    const fourth = ++i;
    switch (n) {
      case 48:
        acc.push(
          (function* () {
            yield* [delay(first, 2), delay(second, 2)];
            yield* [delay(third, 2), delay(fourth, 2)];
          })(),
        );
        continue;
      case 49:
        acc.push(
          (async function* () {
            yield* [delay(first, 2), delay(second, 2)];
            yield* [delay(third, 2), delay(fourth, 2)];
          })(),
        );
        continue;
    }
    throw new Error("Invalid random n value: " + n);
  }
  return acc;
}

export function verifyRandomAsyncFlattableData(data: number[], size: number) {
  expect(data.length).toBeGreaterThanOrEqual(size);
  expect(data.length).toBeLessThanOrEqual(size + 4);
  expect(new Set(data).size).toBe(data.length);
  data.sort((a, b) => a - b);
  for (let i = 0; i < data.length; i++) {
    expect(data[i]).toBe(i);
  }
}
