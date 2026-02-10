import { describe, expect, test } from "vitest";
import { createTestSets } from "../utils/createTestSets.ts";
import "../utils/initTestPolyfills.ts";
describe("some", () => {
  describe("has some", () => {
    createTestSets([false, true, false]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.some(Boolean)) satisfies boolean).toBe(true);
      });
    });
  });

  describe("has none", () => {
    createTestSets([false, false, false]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.some(Boolean)) satisfies boolean).toBe(false);
      });
    });
  });

  describe("has every", () => {
    createTestSets([true, true, true]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.some(Boolean)) satisfies boolean).toBe(true);
      });
    });
  });

  describe("empty", () => {
    createTestSets<boolean>([]).modes.forEach(({ mode, yielded }) => {
      test(`${mode}`, async () => {
        expect((await yielded.some(Boolean)) satisfies boolean).toBe(false);
      });
    });
  });
});
