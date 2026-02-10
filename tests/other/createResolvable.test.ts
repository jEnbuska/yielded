import { describe, expect, test } from "vitest";
import { PromiseWithResolvers } from "../../src/general/utils/createResolvable.ts";
import "../utils/initTestPolyfills.ts";
describe("createResolvable", () => {
  test("resolve", async () => {
    {
      const polyfill = new PromiseWithResolvers<number>();
      const resolvable = Promise.withResolvers<number>();
      polyfill.resolve(1);
      resolvable.resolve(1);
      polyfill.resolve(2);
      resolvable.resolve(2);
      await expect(polyfill.promise).resolves.toBe(1);
      await expect(resolvable.promise).resolves.toBe(1);
    }
    {
      const resolvable = Promise.withResolvers<number>();
      const polyfill = new PromiseWithResolvers<number>();
      polyfill.resolve(1);
      resolvable.resolve(1);
      polyfill.resolve(2);
      resolvable.resolve(2);
      await expect(resolvable.promise).resolves.toBe(1);
      await expect(polyfill.promise).resolves.toBe(1);
    }
  });
  test("resolve and reject", async () => {
    const testError = new Error("Test error");
    {
      const polyfill = new PromiseWithResolvers<number>();
      const resolvable = Promise.withResolvers<number>();
      polyfill.resolve(1);
      polyfill.reject(testError);
      resolvable.resolve(1);
      resolvable.reject(testError);
      await expect(polyfill.promise).resolves.toBe(1);
      await expect(resolvable.promise).resolves.toBe(1);
    }
    {
      const resolvable = Promise.withResolvers<number>();
      const polyfill = new PromiseWithResolvers<number>();
      resolvable.resolve(1);
      resolvable.reject(testError);
      polyfill.resolve(1);
      polyfill.reject(testError);
      await expect(resolvable.promise).resolves.toBe(1);
      await expect(polyfill.promise).resolves.toBe(1);
    }
  });

  test("reject and resolve", async () => {
    const testError = new Error("Test error");
    {
      const polyfill = new PromiseWithResolvers<number>();
      const resolvable = Promise.withResolvers<number>();
      polyfill.reject(testError);
      resolvable.reject(testError);
      polyfill.resolve(1);
      resolvable.resolve(1);
      await expect(polyfill.promise).rejects.toThrowError(testError);
      await expect(resolvable.promise).rejects.toThrowError(testError);
    }
    {
      const resolvable = Promise.withResolvers<number>();
      const polyfill = new PromiseWithResolvers<number>();
      resolvable.reject(testError);
      polyfill.reject(testError);
      resolvable.resolve(1);
      polyfill.resolve(1);
      await expect(resolvable.promise).rejects.toThrowError(testError);
      await expect(polyfill.promise).rejects.toThrowError(testError);
    }
  });

  test("reject", async () => {
    const testError = new Error("Test error");
    {
      const polyfill = new PromiseWithResolvers<number>();
      const resolvable = Promise.withResolvers<number>();
      polyfill.reject(testError);
      resolvable.reject(testError);
      await expect(resolvable.promise).rejects.toThrowError(testError);
      await expect(polyfill.promise).rejects.toThrowError(testError);
    }
    {
      const resolvable = Promise.withResolvers<number>();
      const polyfill = new PromiseWithResolvers<number>();
      resolvable.reject(testError);
      polyfill.reject(testError);
      await expect(polyfill.promise).rejects.toThrowError(testError);
      await expect(resolvable.promise).rejects.toThrowError(testError);
    }
  });

  test("resolve timing", async () => {
    {
      const polyfill = new PromiseWithResolvers<number>();
      const resolvable = Promise.withResolvers<number>();

      let polyfillResolver: any;
      void polyfill.promise.then((result) => {
        polyfillResolver = result;
      });
      let resolvableResolved: any;
      void resolvable.promise.then((result) => {
        resolvableResolved = result;
      });
      polyfill.resolve(1);
      resolvable.resolve(1);
      expect(polyfillResolver).toBe(resolvableResolved);
    }
    {
      const resolvable = Promise.withResolvers<number>();
      const polyfill = new PromiseWithResolvers<number>();

      let resolvableResolved: any;
      void resolvable.promise.then((result) => {
        resolvableResolved = result;
      });

      let polyfillResolver: any;
      void polyfill.promise.then((result) => {
        polyfillResolver = result;
      });
      resolvable.resolve(1);
      polyfill.resolve(1);
      expect(polyfillResolver).toBe(resolvableResolved);
    }
  });
  test("reject timing", async () => {
    const testError = new Error("Test error");
    {
      const polyfill = new PromiseWithResolvers<number>();
      const resolvable = Promise.withResolvers<number>();
      let polyfillRejected: any;
      void polyfill.promise.catch((e) => {
        polyfillRejected = e;
      });
      let resolvableRejected: any;
      void resolvable.promise.catch((e) => {
        resolvableRejected = e;
      });
      polyfill.reject(testError);
      resolvable.reject(testError);
      expect(polyfillRejected).toBe(resolvableRejected);
    }
    {
      const resolvable = Promise.withResolvers<number>();
      const polyfill = new PromiseWithResolvers<number>();

      let resolvableRejected: any;
      void resolvable.promise.catch((e) => {
        resolvableRejected = e;
      });
      let polyfillRejected: any;
      void polyfill.promise.catch((e) => {
        polyfillRejected = e;
      });
      polyfill.reject(testError);
      resolvable.reject(testError);
      expect(polyfillRejected).toBe(resolvableRejected);
    }
  });
});
