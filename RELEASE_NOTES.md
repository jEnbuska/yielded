# Release Notes

## Version 2.0.0

### Overview

This release introduces significant improvements to the `flatMap` operation, including enhanced TypeScript type definitions and comprehensive test coverage to ensure robust functionality across various use cases.

### What's New

#### 🔧 Fixed `flatMap` Type Definitions

The TypeScript type signatures for the `flatMap` operation have been improved to provide better type inference and safety. The new type definitions properly handle:

- Single items (`TOut`)
- Arrays of items (`readonly TOut[]`)
- Iterables and async iterables (`IYieldedIterableSource<TOut, TFlow>`)
- Mixed return types combining arrays, iterables, and promises

**Key Type Improvements:**
- Better inference for return types when mapping to different data structures
- Proper handling of async and parallel flow types
- Enhanced type safety when chaining `flatMap` with other operations
- Correct typing for nested generators and async generators

#### 🧪 Comprehensive `flatMap` Test Suite

Added extensive test coverage for `flatMap` functionality, including:

1. **Random Data Generation Utilities** (`createRandomAsyncFlattableData.ts` - 518 lines)
   - Generates complex, randomized test data with various flattable structures
   - Supports synchronous and asynchronous flattable data patterns
   - Creates test cases with:
     - Plain values
     - Promises and delayed promises
     - Arrays of mixed types
     - Sync and async generators
     - Nested combinations of all above

2. **Extensive Test Coverage** (`flatMap.test.ts` - 176 lines)
   - Tests for non-array inputs
   - Tests for nested arrays
   - Tests for empty iterables
   - Tests for Set and other iterable sources
   - Tests for synchronous and asynchronous generators
   - Tests for delayed async operations
   - Error handling tests
   - Edge case validation

### Implementation Details

#### `flatMap` Implementation

The `flatMap` operation is implemented in three variants to support different execution flows:

1. **Synchronous (`flatMapSync`)**: For synchronous iterables
2. **Asynchronous (`flatMapAsync`)**: For async iterables with sequential processing
3. **Parallel (`flatMapParallel`)**: For concurrent processing with configurable parallelism

Each implementation properly handles:
- Iterables that need to be spread (`yield*`)
- Single values that should be yielded directly
- Proper cleanup and error propagation
- Type-safe transformations

#### Test Utilities

The new `createRandomAsyncFlattableData` utility function creates randomized test data that exercises all possible code paths through the `flatMap` implementation. This includes:

- **50+ different patterns** of flattable data structures
- Random combinations of:
  - Synchronous values
  - Promises
  - Delayed promises (using `delay()`)
  - Synchronous generators
  - Asynchronous generators
  - Mixed arrays with all of the above
- Verification functions to ensure data integrity

### Benefits

✅ **Type Safety**: Improved TypeScript definitions catch more errors at compile time

✅ **Reliability**: Comprehensive tests ensure consistent behavior across all use cases

✅ **Performance**: Optimized implementations for sync, async, and parallel processing

✅ **Developer Experience**: Better IDE autocompletion and type hints

### Migration Notes

This is a major version release (2.0.0). The type improvements should be backward compatible for most use cases, but stricter type checking may reveal previously hidden type errors in consuming code.

If you encounter type errors after upgrading:
1. Review the type signatures in your `flatMap` callbacks
2. Ensure return types match one of the supported patterns (single value, array, or iterable)
3. Add explicit type annotations if needed to help TypeScript's type inference

### Testing

All tests pass successfully with full coverage of:
- Synchronous operations
- Asynchronous operations
- Parallel processing modes
- Edge cases and error conditions
- Large-scale randomized stress tests

### Credits

This release represents a significant investment in code quality and type safety, ensuring that the `flatMap` operation works correctly in all scenarios.

---

**Full Changelog**: See [CHANGELOG.md](./CHANGELOG.md) for the complete version history.
