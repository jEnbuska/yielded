# Release Notes

## Version 2.0.0

### Overview

Significantly improve the how the parallel generators are resolved, while adding the confidence of potentially edge cases previously not being not that well covered.

The parallel operation execution order might be different than on previous release, so now added documentation change for parallel highlighting the fact that the any order of the execution should not be trusted / expected.

Fixed the typing of awaited and parallel flatMap output that in some cases was assuming the output will included un awaited values even though async and parallel flatMap resolve those promises 

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

---

**Full Changelog**: See [CHANGELOG.md](./CHANGELOG.md) for the complete version history.
