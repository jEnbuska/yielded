import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
const createAbortedSet = () =>
  createTestSets([1, 2, 3, 4, 5]).modes.map(({ yielded, mode }) => {
    const controller = new AbortController();
    controller.abort();
    let tapped = 0;

    return {
      mode,
      getTapped() {
        return tapped;
      },
      yielded: yielded
        .tap(() => {
          tapped++;
        })
        .withSignal(controller.signal),
    };
  });
describe("withSignal", () => {
  describe("abort during iteration", () => {
    createTestSets([1, 2, 3]).modes.forEach(({ yielded, mode }) => {
      const controller = new AbortController();
      let tapped = 0;
      test(mode, async () => {
        await yielded
          .tap(() => {
            tapped++;
          })
          .withSignal(controller.signal)
          .forEach((_, i) => {
            if (i === 1) {
              controller.abort();
            }
          });
        expect(tapped).toBe(2);
      });
    });
  });
  describe("abort before iteration", () => {
    describe("reduce", () => {
      describe("without initial value", () => {
        createAbortedSet().forEach(({ yielded, mode, getTapped }) => {
          const apply = async () => {
            await yielded.reduce((acc, next) => acc + next);
          };
          test(mode, async () => {
            await expect(apply()).rejects.toThrowError(TypeError);
            expect(getTapped()).toBe(0);
          });
        });
      });

      describe("without initial value", () => {
        createAbortedSet().forEach(({ yielded, mode, getTapped }) => {
          test(mode, async () => {
            await (yielded.reduce as any)(
              (acc: any, next: any) => acc + next,
              0,
            );
            expect(getTapped()).toBe(0);
          });
        });
      });
    });
    describe("groupBy", () => {
      createAbortedSet().forEach(({ yielded, mode, getTapped }) =>
        test(mode, async () => {
          await (yielded.groupBy as any)((next: any) => `${next}`);
          expect(getTapped()).toBe(0);
        }),
      );
    });

    (["find", "some", "sumBy", "forEach"] as const).map((method) => {
      describe(method, () => {
        createAbortedSet().forEach(({ yielded, mode, getTapped }) =>
          test(mode, async () => {
            await yielded[method]((_) => _);
            expect(getTapped()).toBe(0);
          }),
        );
      });
    });

    (
      [
        "consume",
        "toArray",
        "toSorted",
        "toSet",
        "toReversed",
        "count",
      ] as const
    ).forEach((method) => {
      describe(method, () => {
        createAbortedSet().forEach(({ yielded, mode, getTapped }) =>
          test(mode, async () => {
            await yielded[method]();
            expect(getTapped()).toBe(0);
          }),
        );
      });
    });

    const firstAndLast = ["first", "last"] as const;
    firstAndLast.forEach((method) => {
      createAbortedSet().forEach(({ yielded, mode, getTapped }) => {
        test(`${method} ${mode} should throw without default`, async () => {
          async function apply() {
            return (yielded[method] as any)();
          }
          expect(getTapped()).toBe(0);
          await expect(apply()).rejects.toThrowError(TypeError);
        });
      });
    });

    firstAndLast.forEach((method) => {
      createAbortedSet().forEach(({ yielded, mode, getTapped }) => {
        test(`${method} ${mode} should not throw with default`, async () => {
          async function apply() {
            return (yielded[method] as any)("-1");
          }
          expect(getTapped()).toBe(0);
          expect(await apply()).toBe("-1");
        });
      });
    });
  });
});
