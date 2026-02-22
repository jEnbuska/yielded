# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0-beta.0] - 2026-02-22

> **Beta release.** Please test and [report any issues](https://github.com/jEnbuska/yielded/issues) before the final 2.1.0 release.
> Install: `npm install @jenbuska/yielded@beta`

### Added
- **Example projects** under `examples/` that verify the package works when consumed as a dependency:
  - `examples/node-ts` — barebones Node.js TypeScript project demonstrating sync and async pipelines
  - `examples/react-vite` — Vite 7 + React 19 app wired through Yielded with a counter button
- **Cross-browser Playwright test suite** in `examples/react-vite/tests/app.spec.ts` covering Chromium, Firefox, WebKit (Safari), and Edge
- CI jobs for both example projects (`test-example-node`, `test-example-react`)
- `test:examples`, `test:example:node`, `test:example:react` npm scripts in root `package.json`
- `check-all` now includes example project verification
- `npm run link` script for local integration testing before publishing

### Changed
- **Bundle size reduced by 57%** (55.46 KB → 23.45 KB): enabled `minify: true` in tsup and replaced `using` keyword with `try/finally` blocks, eliminating the tsup-generated polyfill helpers
- **TypeScript declarations fixed**: switched from `tsc --emitDeclarationOnly` to tsup's `dts: true` option — all types are now bundled into a single `dist/index.d.ts` with no cross-file `.ts` extension references, so consumer projects resolve types correctly without any extra tsconfig flags
- Build script now cleans `dist/` before building (`rm -rf dist && tsup`)
- `prettier` and `prettier:write` scripts now also cover `./examples`
- **Minimum Node.js version lowered to 20.4.0** (from 20.5.0): removing the `using` keyword (replaced with `try/finally`) eliminated the dependency on the flag-gated `using` syntax; `Symbol.dispose` and `Symbol.asyncDispose`, which are the only remaining runtime requirements, have been available since Node 20.4.0
- **Node.js CI matrix**: `test-example-node` CI job now runs on Node 20, 22, and 24 to verify compatibility across all current LTS releases
- Added `"engines": { "node": ">=20.4.0" }` to `package.json`

### Fixed
- Declaration files previously contained `.ts` extensions in import paths (e.g. `from "./sync/types.ts"`), which caused TypeScript errors in consumer projects that lacked `allowImportingTsExtensions`. Now fixed by bundling all types into one file.

## [2.0.0] - 2026-02-18

### Added
- 💣 - The parallel operation execution order might be different from on previous release. Added documentation change for parallel highlighting the fact that any order of the execution should not be assumed / expected.
- Significantly improve how the parallel generators are resolved, while adding the confidence of potentially edge cases previously not being not that well covered. 
- Fixed the typing of awaited and parallel flatMap output that in some cases was assuming the output will include un awaited values even though async and parallel flatMap resolve those promises before chained to next.
- Added extensive test coverage for `flatMap` functionality

## [1.1.1] - 2026-02-11

### Added
- npm package badge to README for easier package discovery and installation
- Fixed inconsistencies when tranforming paralle stream to awaited stream

## [1.1.0] - 2026-02-11

### Added
- Comprehensive compatibility documentation in README
- Clear Node.js version requirement (20.5.0+) highlighting
- Browser support information with polyfill/Babel guidance for older browsers and Safari
- Documentation about ES2023 features (`using` keyword, `Symbol.dispose`, `Symbol.asyncDispose`)

## [1.0.1] - 2026-02-11

### Fixed
- Fixed bug in ParallelGenerator that was dropping values when using flatMap with async generators
- Fixed type definitions for async flat operations to properly handle awaited values

### Changed
- Improved handling of promise values in flat operations
- Refactored ParallelGenerator to remove overlapping code and improve reliability

## [1.0.0] - 2026-02-10

### Added
- Initial release of Yielded
- Lazy evaluation for synchronous iterables and asynchronous generators
- Parallel processing with configurable concurrency limits
- Unified API for both sync and async operations
- Native Iterator API extensions
- Full TypeScript support with comprehensive type inference
- Integrated AbortSignal support for canceling async operations
- Transformation operations: `map`, `filter`, `flatMap`, `flat`
- Slicing operations: `take`, `drop`, `takeLast`, `dropLast`, `takeWhile`
- Sorting and ordering: `sorted`, `reversed`
- Batching and grouping: `batch`, `chunkBy`, `groupBy`
- Async and parallel operations: `parallel`, `awaited`
- Utility operations: `tap`, `mapPairwise`, `lift`, `withSignal`
- Terminal operations: `toArray`, `toSet`, `toSorted`, `toReversed`, `reduce`, `forEach`, `consume`, `find`, `some`, `every`, `first`, `last`, `count`, `sumBy`, `minBy`, `maxBy`
- Comprehensive test coverage
- Full API documentation in README

[Unreleased]: https://github.com/jEnbuska/yielded/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/jEnbuska/yielded/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/jEnbuska/yielded/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/jEnbuska/yielded/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jEnbuska/yielded/releases/tag/v1.0.0
