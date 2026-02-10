import { expect } from "vitest";

export function simpleMock<T extends any[]>(args: T) {
  let index = 0;
  let called = 0;
  return Object.assign(
    (n: number) => {
      called++;
      const expected = args[index++];
      expect(n).toBe(expected);
    },
    {
      getCalled() {
        return called;
      },
    },
  );
}
