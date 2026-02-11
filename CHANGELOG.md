# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-02-11

### Fixed
- Fixed bug in ParallelGenerator that was dropping values when using flatMap with async generators
- Fixed type definitions for async flat operations to properly handle awaited values

### Changed
- Improved handling of promise values in flat operations
- Refactored ParallelGenerator to remove overlapping code and improve reliability

## [1.0.0] - TBD

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

[Unreleased]: https://github.com/jEnbuska/yielded/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/jEnbuska/yielded/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jEnbuska/yielded/releases/tag/v1.0.0
