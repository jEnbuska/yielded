import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";

describe("every", () => {
  describe("has some", () => {
    createTestSets([false, true, false]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.every(Boolean)) satisfies boolean).toBe(false);
      });
    });
  });

  describe("has none", () => {
    createTestSets([false, false, false]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.every(Boolean)) satisfies boolean).toBe(false);
      });
    });
  });

  describe("has every", () => {
    createTestSets([true, true, true]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.every(Boolean)) satisfies boolean).toBe(true);
      });
    });
  });

  describe("empty", () => {
    createTestSets<boolean>([]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.every(Boolean)) satisfies boolean).toBe(true);
      });
    });
  });
});
