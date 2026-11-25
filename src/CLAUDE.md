# The library's code

Rules for `src/`, on top of the root [CLAUDE.md](../CLAUDE.md).

## Public API

- The public API is exactly what [`index.ts`](index.ts) exports: the `Yielded` class and the `IYielded`, `IAsyncYielded` and `IParallelYielded` types, with every method they declare. Anything else in `src/` is internal and may change freely.
- A change to the public API's behaviour or types is a breaking change unless it only adds something or fixes a behaviour that contradicts the docs. Breaking changes need the user's OK and a `### Changed` (or `### Removed`) entry under `## [Unreleased]` in `CHANGELOG.md` that says how to migrate. The version number is the user's, in the release PR.
- The library has no runtime dependencies and needs none.

## The three flows

Every operator and resolver exists in up to three flows, chosen by the pipeline it's called on:

- **sync**: `Yielded<T>` (`sync/Yielded.ts`), over a sync generator. Resolvers return the value itself.
- **async**: `AsyncYielded<T>` (`async/AsyncYielded.ts`), after `.awaited()` or from an async source. Items are awaited one at a time, in order, and resolvers return a `Promise`.
- **parallel**: `ParallelYielded<T>` (`parallel/ParallelYielded.ts`), after `.parallel(n)`. Up to `n` items are in flight at once through `generators/parallel/ParallelGenerator.ts`, and resolvers return a `Promise`.

Where things are:

- `generators/apply/<name>.ts`: an operator (a step that yields to the next one): its interface with the JSDoc, and its `<name>Sync`, `<name>Async` and `<name>Parallel` implementations.
- `resolvers/apply/<name>.ts`: a resolver (a terminal step that returns a value) in the same layout, wired up in `resolvers/{sync,async,parallel}/*Resolver.ts`.
- `generators/types.ts` and `resolvers/types.ts`: the interfaces the three classes share, typed by flow with `IYieldedFlow`, `INextYielded` and `IResolverReturn`.

Rules:

- An operator or resolver behaves the same in every flow it exists in, apart from what the flow itself changes (sync vs. `Promise`, order and concurrency in `parallel`). Where `parallel` gives a different order or buffers, the JSDoc says so.
- A sync resolver never returns a `Promise`. Wire each class to its own flow's implementation (`reduceSync` for `Yielded`, and so on).
- Operators are lazy: nothing runs until the pipeline is consumed. An operator that has to buffer (`sorted`, `reversed`, `takeLast`, `dropLast`) says so in its JSDoc.
- Stopping early (`take`, `first`, `find`, `some`, `every`, an error, an `AbortSignal`) closes the source: its generator's `finally` blocks run.
- Errors thrown by a callback or a source reach the caller, from the resolver, in every flow. Invalid arguments throw a `RangeError` or `TypeError` when the method is called, not when the pipeline runs, with a message that names the method and the value.

## Native Iterator helpers and polyfills

Where the runtime has a native `Iterator.prototype` helper with the same name (`map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every`, `find`), the sync flow uses it (`general/utils/hasNative.ts`), and otherwise its own implementation.

- Both paths give the same results. Where the native helper's behaviour is defined (argument coercion, errors, closing the source), the polyfill follows it.
- `Yielded.__USE_POLYFILL_ONLY__` forces the polyfills. `pnpm test` runs the whole suite once with it, so every test covers both paths.
- Code must run on the oldest runtime in `engines` (Node.js 20.4.0, which has no native Iterator helpers) and in browsers with ES2022. Use a newer API only behind a check, with a fallback.

## Docs

- Every public method's JSDoc, on its interface in `apply/`, is the reference: what it does, how each flow differs, what it buffers, what it throws, and an `@example` whose shown output is the real output. The README summarises it and must not contradict it.
- When code and docs disagree, find out which one is intended before changing either. If the code is wrong, that's a bug ticket.
