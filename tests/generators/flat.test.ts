import { describe, expect, test } from "vitest";
import type { INextYielded, IYieldedFlow } from "../../src/general/types.ts";
import { Yielded } from "../../src/index.ts";
import { createTestSets, handleExpect } from "../utils/createTestSets.ts";

/* Verify typing after flatmap is expected */
function verify<T>() {
  return (_: T) => {};
}
describe("flat", () => {
  {
    const numbers = [1, 2, 3];
    function flatten<
      const TFlow extends IYieldedFlow,
      T,
      const D extends number,
    >(
      yielded: INextYielded<T, TFlow>,
      depth: D,
    ): Array<FlatArray<T[], D>> | Promise<Array<FlatArray<T[], D>>> {
      return (
        yielded
          .tap(verify<FlatArray<T[], 0>>())
          .flat(depth)
          // Verify typing works correctly
          .tap(verify<FlatArray<T[], D>>())
          .toArray()
      );
    }
    describe("depth 0", () => {
      const depth = 0;
      describe("singles", () => {
        createTestSets(numbers).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe("1 deep array", () => {
        createTestSets([numbers]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([numbers]);
          });
        });
      });
      describe(`2 deep array`, () => {
        createTestSets([[numbers]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([[numbers]]);
          });
        });
      });
    });

    describe("depth 1", () => {
      const depth = 1;
      describe("singles", () => {
        createTestSets(numbers).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe("1 deep array", () => {
        createTestSets([numbers]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe(`2 deep array`, () => {
        createTestSets([[numbers]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([numbers]);
          });
        });
      });
      describe(`3 deep array`, () => {
        createTestSets([[[numbers]]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([[numbers]]);
          });
        });
      });
    });

    describe("depth 2", () => {
      const depth = 2;
      describe("singles", () => {
        createTestSets(numbers).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe("1 deep array", () => {
        createTestSets([numbers]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe(`2 deep array`, () => {
        createTestSets([[numbers]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe(`3 deep array`, () => {
        createTestSets([[[numbers]]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([numbers]);
          });
        });
      });
      describe(`4 deep array`, () => {
        createTestSets([[[[numbers]]]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([[numbers]]);
          });
        });
      });
    });

    describe("depth 3", () => {
      const depth = 3;
      describe("singles", () => {
        createTestSets(numbers).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe("1 deep array", () => {
        createTestSets([numbers]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe(`2 deep array`, () => {
        createTestSets([[numbers]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe(`3 deep array`, () => {
        createTestSets([[[numbers]]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[] = await flatten(yielded, depth);
            expect(result).toStrictEqual(numbers);
          });
        });
      });
      describe(`4 deep array`, () => {
        createTestSets([[[[numbers]]]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([numbers]);
          });
        });
      });
      describe(`5 deep array`, () => {
        createTestSets([[[[[numbers]]]]]).modes.forEach(({ yielded, mode }) => {
          test(mode, async () => {
            const result: number[][][] = await flatten(yielded, depth);
            expect(result).toStrictEqual([[numbers]]);
          });
        });
      });
    });

    describe("mixed", () => {
      const input = [1, [2, [3, [4, [5]]]]];
      describe("depth 0", () => {
        createTestSets([1, [2, [3, [4, [5]]]]]).modes.forEach(
          ({ mode, yielded }) => {
            test(mode, async () => {
              const result = (await flatten(yielded, 0)) satisfies Array<
                | number
                | Array<number | Array<number | Array<number | number[]>>>
              >;
              expect(result).toStrictEqual(input);
            });
          },
        );
      });
      describe("depth 1", () => {
        createTestSets([1, [2, [3, [4, [5]]]]]).modes.forEach(
          ({ mode, yielded }) => {
            test(mode, async () => {
              const result = (await flatten(yielded, 1)) satisfies Array<
                number | Array<number | Array<number | number[]>>
              >;
              expect(result).toStrictEqual([1, 2, [3, [4, [5]]]]);
            });
          },
        );
      });
      describe("depth 2", () => {
        createTestSets([1, [2, [3, [4, [5]]]]]).modes.forEach(
          ({ mode, yielded }) => {
            test(mode, async () => {
              const result = (await flatten(yielded, 2)) satisfies Array<
                number | Array<number | number[]>
              >;
              expect(result).toStrictEqual([1, 2, 3, [4, [5]]]);
            });
          },
        );
      });
      describe("depth 3", () => {
        createTestSets([1, [2, [3, [4, [5]]]]]).modes.forEach(
          ({ mode, yielded }) => {
            test(mode, async () => {
              const result = (await flatten(yielded, 3)) satisfies Array<
                number | number[]
              >;
              expect(result).toStrictEqual([1, 2, 3, 4, [5]]);
            });
          },
        );
      });

      describe("depth 4", () => {
        createTestSets([1, [2, [3, [4, [5]]]]]).modes.forEach(
          ({ mode, yielded }) => {
            test(mode, async () => {
              const result = (await flatten(
                yielded,
                4,
              )) satisfies Array<number>;
              expect(result).toStrictEqual([1, 2, 3, 4, 5]);
            });
          },
        );
      });
    });
  }

  describe("flat mixed", () => {
    createTestSets([[[1, 2]], [], [3, [4, 5]]]).modes.forEach(
      ({ mode, yielded }) => {
        test(mode, async () => {
          const result = (await yielded.flat(5).toArray()) satisfies number[]; // [1,2,3,4,5]

          await handleExpect(mode, result, [1, 2, 3, 4, 5]);
        });
      },
    );
  });

  describe("from empty", () => {
    createTestSets<number>([]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded.flat(5).toArray()) satisfies number[];
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe("from nested empty", () => {
    createTestSets<number[]>([[], []]).modes.forEach(({ mode, yielded }) => {
      test(mode, async () => {
        const result = (await yielded.flat(5).toArray()) satisfies number[];
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe("from documentation examples", () => {
    test("flat default dept", () => {
      expect(
        Yielded.from([[1], [2], [3]])
          .flat()
          .toArray() satisfies number[],
      ).toStrictEqual([1, 2, 3]);
    });

    test("flat dept 2", () => {
      expect(
        Yielded.from([[1], [[2]], [[[3]]]])
          .flat(2)
          .toArray() satisfies Array<number | number[]>,
      ).toStrictEqual([1, 2, [3]]);
    });
    test("flat default dept mixed values", () => {
      expect(
        Yielded.from([1, [2, [3, 4]], 5])
          .flat()
          .toArray() satisfies Array<number | number[]>,
      ).toStrictEqual([1, 2, [3, 4], 5]);
    });
  });
});
