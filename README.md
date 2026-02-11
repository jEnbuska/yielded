# Yielded

A TypeScript library for composing and transforming values from synchronous iterables and asynchronous generators through a uniform, lazy-evaluated pipeline API.

[![CI](https://img.shields.io/github/actions/workflow/status/jEnbuska/yielded/ci.yml?branch=main&label=CI)](https://github.com/jEnbuska/yielded/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-20.5.0+-green.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-@jenbuska/yielded-red.svg)](https://www.npmjs.com/package/@jenbuska/yielded)

## Features

- 🔄 **Lazy Evaluation** - Operations don't process the entire sequence up front; each value flows through the pipeline one at a time
- 🚀 **Parallel Processing** - Built-in support for concurrent async operations with configurable concurrency limits
- 🔗 **Unified API** - Same familiar API for both sync iterables and async iterators
- 📦 **Native Iterator Extension** - Extends the native [Iterator API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/Iterator) with additional utilities
- 🛡️ **Type-Safe** - Full TypeScript support with comprehensive type inference
- 🎯 **Cancelable** - Integrated AbortSignal support for canceling async operations
- 🌊 **Composable** - Chain multiple operations together for complex data transformations

## Compatibility

**⚠️ Important: Node.js and Browser Requirements**

This library requires **Node.js 20.5.0 or newer** because it uses ES2023 features including:
- The `using` keyword for [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management)
- `Symbol.dispose` and `Symbol.asyncDispose` for automatic cleanup

**Browser Support:**
- ✅ **Modern Browsers**: Chrome 90+, Firefox 88+, Edge 90+ (with full ES2022+ support)
- ⚠️ **Safari & Older Browsers**: May require polyfills or transpilation with [Babel](https://babeljs.io/) to support the `using` keyword and disposal symbols

If you need to support older browsers or Safari versions without native support for these features, you will need to:
1. Use Babel with appropriate plugins to transpile the `using` keyword
2. Include polyfills for `Symbol.dispose` and `Symbol.asyncDispose`
3. Configure your build toolchain to target the appropriate JavaScript version

## Installation

```bash
npm install @jenbuska/yielded
```

## Quick Start

```typescript
import { Yielded } from "@jenbuska/yielded";

// Simple transformation pipeline
const result = Yielded.from([1, 2, 3, 4, 5])
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .toArray();
// => [4, 8]

// Async data processing with parallel operations
const customers = await Yielded.from(contractorIds)
  .parallel(5) // Process up to 5 at a time
  .flatMap(async id => await fetchCustomers(id))
  .awaited() // Back to sequential processing
  .filter(customer => customer.isActive)
  .sorted((a, b) => a.name.localeCompare(b.name))
  .take(10)
  .toArray();
```

## Core Concepts

### Lazy Evaluation

Operations in Yielded are **lazy** - they don't execute until you consume the result. This means you can chain multiple transformations efficiently without creating intermediate arrays:

```typescript
Yielded.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .filter(n => n % 2 === 0)  // Not executed yet
  .map(n => n * 2)            // Not executed yet
  .take(3)                    // Not executed yet
  .toArray();                 // NOW all operations execute
// => [4, 8, 12]
```

### Creating Yielded Instances

```typescript
// From arrays
Yielded.from([1, 2, 3])

// From any iterable
Yielded.from(new Set([1, 2, 3]))
Yielded.from("hello") // chars: 'h', 'e', 'l', 'l', 'o'

// From async iterables
Yielded.from(asyncGenerator())

// From promises
Yielded.from(Promise.resolve([1, 2, 3]))
```

## API Reference

### Transformation Operations

Transform values as they flow through the pipeline:

#### [`map(mapper)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/map)
Transform each value with a mapping function.

```typescript
Yielded.from([1, 2, 3])
  .map(n => n * 2)
  .toArray()
// => [2, 4, 6]
```

#### [`filter(predicate)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/filter)
Keep only values that pass the predicate test.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .filter(n => n % 2 === 0)
  .toArray()
// => [2, 4]
```

#### [`flatMap(mapper)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/flatMap)
Map each value to an array/iterable and flatten the results.

```typescript
Yielded.from([1, 2, 3])
  .flatMap(n => [n, n * 2])
  .toArray()
// => [1, 2, 2, 4, 3, 6]
```

#### [`flat(depth?)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)
Flatten nested arrays up to the specified depth (default: 1).

```typescript
Yielded.from([[1, 2], [3, [4, 5]]])
  .flat()
  .toArray()
// => [1, 2, 3, [4, 5]]
```

### Slicing Operations

Control which values pass through:

#### [`take(count)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/take)
Take only the first `count` values.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .take(3)
  .toArray()
// => [1, 2, 3]
```

#### [`drop(count)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/drop)
Skip the first `count` values.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .drop(2)
  .toArray()
// => [3, 4, 5]
```

#### `takeLast(count)`
Take only the last `count` values.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .takeLast(2)
  .toArray()
// => [4, 5]
```

#### `dropLast(count)`
Drop the last `count` values.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .dropLast(2)
  .toArray()
// => [1, 2, 3]
```

#### [`takeWhile(predicate)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/takeWhile)
Take values while the predicate returns true, stop at the first false.

```typescript
Yielded.from([2, 4, 6, 7, 8])
  .takeWhile(n => n % 2 === 0)
  .toArray()
// => [2, 4, 6]
```

### Sorting and Ordering

#### `sorted(comparator?)`
Sort all values using an optional comparator function.

```typescript
Yielded.from([3, 1, 4, 1, 5])
  .sorted()
  .toArray()
// => [1, 1, 3, 4, 5]

Yielded.from(['banana', 'apple', 'cherry'])
  .sorted((a, b) => a.localeCompare(b))
  .toArray()
// => ['apple', 'banana', 'cherry']
```

#### `reversed()`
Reverse the order of all values.

```typescript
Yielded.from([1, 2, 3])
  .reversed()
  .toArray()
// => [3, 2, 1]
```

### Batching and Grouping

#### `batch(size)`
Group values into arrays of the specified size.

```typescript
Yielded.from([1, 2, 3, 4, 5, 6, 7])
  .batch(3)
  .toArray()
// => [[1, 2, 3], [4, 5, 6], [7]]
```

#### `chunkBy(predicate)`
Group consecutive values while the predicate returns the same key.

```typescript
Yielded.from([1, 2, 2, 3, 3, 3, 4])
  .chunkBy(n => n)
  .toArray()
// => [[1], [2, 2], [3, 3, 3], [4]]
```

#### `groupBy(keySelector, groups?)`
Group all values by the result of the key selector function.

```typescript
Yielded.from([
  { type: 'fruit', name: 'apple' },
  { type: 'vegetable', name: 'carrot' },
  { type: 'fruit', name: 'banana' }
])
  .groupBy(item => item.type)
// => {
//   fruit: [{ type: 'fruit', name: 'apple' }, { type: 'fruit', name: 'banana' }],
//   vegetable: [{ type: 'vegetable', name: 'carrot' }]
// }
```

### Async and Parallel Operations

#### `parallel(concurrency)`
Process async operations with limited concurrency. Returns a `ParallelYielded` instance.

**Note:** `concurrency` must be an integer between 1 and 50 (inclusive).

```typescript
await Yielded.from([1, 2, 3, 4, 5])
  .parallel(2) // Max 2 concurrent operations
  .flatMap(async n => {
    await delay(100);
    return n * 2;
  })
  .awaited()
  .toArray()
// => [2, 4, 6, 8, 10]
```

#### `awaited()`
Convert parallel or async operations back to sequential async processing.

```typescript
Yielded.from([Promise.resolve(1), Promise.resolve(2)])
  .awaited()
  .map(n => n * 2)
  .toArray()
```

### Utility Operations

#### `tap(callback)`
Execute a side effect for each value without modifying the stream.

```typescript
Yielded.from([1, 2, 3])
  .tap(n => console.log('Processing:', n))
  .map(n => n * 2)
  .toArray()
// Logs: Processing: 1, Processing: 2, Processing: 3
// => [2, 4, 6]
```

#### `mapPairwise(mapper)`
Transform consecutive pairs of values.

```typescript
Yielded.from([1, 2, 3, 4])
  .mapPairwise((prev, next) => next - prev)
  .toArray()
// => [1, 1, 1]
```

#### `lift(middleware)`
Apply a custom generator transformation.

```typescript
Yielded.from([1, 2, 3])
  .lift(function*(gen) {
    for (const value of gen) {
      yield value;
      yield value * 10;
    }
  })
  .toArray()
// => [1, 10, 2, 20, 3, 30]
```

#### `withSignal(signal)`
Attach an AbortSignal to cancel async operations.

```typescript
const controller = new AbortController();
const promise = Yielded.from(hugeDataset)
  .parallel(10)
  .flatMap(async item => await processItem(item))
  .withSignal(controller.signal)
  .toArray();

// Later: cancel the operation
controller.abort();
```

### Terminal Operations (Resolvers)

These operations consume the iterator and return a final result:

#### [`toArray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/toArray)
Collect all values into an array.

```typescript
Yielded.from([1, 2, 3]).toArray()
// => [1, 2, 3]
```

#### `toSet()`
Collect all values into a Set.

```typescript
Yielded.from([1, 2, 2, 3]).toSet()
// => Set { 1, 2, 3 }
```

#### [`toSorted(comparator?)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
Return a sorted array without modifying the original.

```typescript
Yielded.from([3, 1, 2]).toSorted()
// => [1, 2, 3]
```

#### [`toReversed()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)
Return a reversed array.

```typescript
Yielded.from([1, 2, 3]).toReversed()
// => [3, 2, 1]
```

#### [`reduce(reducer, initialValue?)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/reduce)
Reduce all values to a single value.

**Note:** Without `initialValue`, throws a `TypeError` if the iterator is empty.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .reduce((sum, n) => sum + n, 0)
// => 15

Yielded.from([1, 2, 3])
  .reduce((max, n) => Math.max(max, n))
// => 3
```

#### [`forEach(callback)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/forEach)
Execute a function for each value.

```typescript
Yielded.from([1, 2, 3])
  .forEach((n, index) => console.log(`${index}: ${n}`))
// Logs: 0: 1, 1: 2, 2: 3
```

#### `consume()`
Consume all values without collecting them (useful for side effects).

```typescript
Yielded.from([1, 2, 3])
  .tap(n => saveToDatabase(n))
  .consume()
```

#### [`find(predicate)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/find)
Find the first value that passes the predicate.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .find(n => n > 3)
// => 4
```

#### [`some(predicate)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/some)
Check if any value passes the predicate.

```typescript
Yielded.from([1, 2, 3, 4, 5])
  .some(n => n > 3)
// => true
```

#### [`every(predicate)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/every)
Check if all values pass the predicate.

```typescript
Yielded.from([2, 4, 6, 8])
  .every(n => n % 2 === 0)
// => true
```

#### `first(defaultValue?)`
Get the first value.

**Note:** Without `defaultValue`, throws a `TypeError` if the iterator is empty.

```typescript
Yielded.from([1, 2, 3]).first()
// => 1

Yielded.from([]).first(0)
// => 0

Yielded.from([]).first()
// Throws TypeError
```

#### `last(defaultValue?)`
Get the last value.

**Note:** Without `defaultValue`, throws a `TypeError` if the iterator is empty.

```typescript
Yielded.from([1, 2, 3]).last()
// => 3

Yielded.from([]).last(0)
// => 0

Yielded.from([]).last()
// Throws TypeError
```

#### `count()`
Count the total number of values.

```typescript
Yielded.from([1, 2, 3, 4, 5]).count()
// => 5
```

#### `sumBy(selector?)`
Sum all values, optionally using a selector function.

```typescript
Yielded.from([1, 2, 3, 4, 5]).sumBy()
// => 15

Yielded.from([{x: 1}, {x: 2}, {x: 3}]).sumBy(obj => obj.x)
// => 6
```

#### `minBy(selector?, defaultValue?)`
Find the minimum value, optionally using a selector function.

**Note:** Without `defaultValue`, throws a `TypeError` if the iterator is empty.

```typescript
Yielded.from([3, 1, 4, 1, 5]).minBy(n => n)
// => 1

Yielded.from([{x: 3}, {x: 1}, {x: 2}]).minBy(obj => obj.x)
// => {x: 1}

Yielded.from<{x: number}>([]).minBy(obj => obj.x, 0)
// => 0

Yielded.from<{x: number}>([]).minBy(obj => obj.x)
// Throws TypeError
```

#### `maxBy(selector?, defaultValue?)`
Find the maximum value, optionally using a selector function.

**Note:** Without `defaultValue`, throws a `TypeError` if the iterator is empty.

```typescript
Yielded.from([3, 1, 4, 1, 5]).maxBy()
// => 5

Yielded.from([{x: 3}, {x: 1}, {x: 2}]).maxBy(obj => obj.x)
// => {x: 3}

Yielded.from<{x: number}>([]).maxBy(obj => obj.x, 0)
// => 0

Yielded.from<{x: number}>([]).maxBy((obj) => obj.x)
// Throws TypeError
```

## Advanced Examples

### Real-World Data Processing

```typescript
import { Yielded } from "@jenbuska/yielded";

// Paginated API data fetching with parallel processing
async function getCustomersForOrganization(
  organizationId: string,
  pagination: PaginationArgs,
  signal?: AbortSignal
) {
  const { page, pageSize, sortBy, sortDirection } = pagination;
  
  return Yielded.from(getContractors(organizationId))
    // Allow up to 5 concurrent API calls
    .parallel(5)
    .flatMap(async (contractor) => {
      const customers = await getContractorCustomers(
        contractor.contractorId,
        { signal }
      );
      return customers.map(customer => ({
        ...customer,
        contractorId: contractor.contractorId
      }));
    })
    // Back to sequential processing
    .awaited()
    .filter(customer => customer.isActive)
    .sorted(createComparator({ sortBy, sortDirection }))
    .drop(page * pageSize)
    .take(pageSize)
    .withSignal(signal)
    .toArray();
}
```

### Stream Processing with Error Handling

```typescript
async function processLogFiles(files: string[]) {
  return Yielded.from(files)
    .parallel(3)
    .flatMap(async (filename) => {
      try {
        const content = await readFile(filename);
        return parseLogEntries(content);
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
        return [];
      }
    })
    .awaited()
    .filter(entry => entry.level === 'ERROR')
    .groupBy(entry => entry.timestamp.slice(0, 10)) // Group by date
    .toArray();
}
```

### Infinite Sequences

```typescript
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take only what you need from infinite sequences
const firstTenFibs = Yielded.from(fibonacci())
  .take(10)
  .toArray();
// => [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

## TypeScript Support

Yielded is written in TypeScript and provides full type inference:

```typescript
import { Yielded, type IYielded, type IAsyncYielded } from "@jenbuska/yielded";

// Types are automatically inferred
const numbers: IYielded<number> = Yielded.from([1, 2, 3]);
const strings = numbers.map(n => n.toString()); // IYielded<string>
const evens = numbers.filter((n): n is 2 | 4 => n % 2 === 0); // Type narrowing works!

// Async types
const asyncNumbers: IAsyncYielded<number> = Yielded.from(asyncGenerator());
```

## Performance Considerations

- **Lazy evaluation** means operations only execute when needed, saving CPU cycles
- **Memory efficient** - processes one item at a time instead of creating intermediate arrays
- **Parallel processing** - leverage concurrency for I/O-bound async operations
- **Native methods** - uses native Iterator methods when available for better performance

### When to Use Yielded

✅ **Good use cases:**
- Processing large datasets that don't fit in memory
- Async data pipelines with multiple transformation steps
- Stream processing with lazy evaluation
- Parallel async operations with concurrency control

❌ **Consider alternatives:**
- Simple array operations where you need all data immediately (use native array methods)
- Very small datasets where overhead isn't worth it
- When you need random access to elements

## Browser and Node.js Support

**Node.js:**
- **Minimum version: 20.5.0+** (required for `using` keyword and disposal symbols)
- ES2023 features support required

**Browsers:**
- **Modern browsers** with ES2022+ support: Chrome 90+, Firefox 88+, Edge 90+
- **Safari & Legacy browsers**: Require polyfills or Babel transpilation for:
  - `using` keyword (Explicit Resource Management)
  - `Symbol.dispose` and `Symbol.asyncDispose`

For production use with broad browser support, configure your build pipeline with Babel and appropriate polyfills.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

MIT © [jEnbuska](https://github.com/jEnbuska)

## Related Resources

- [MDN: Iterator Protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
- [MDN: Iterator Helpers Proposal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)
- [TC39 Iterator Helpers Proposal](https://github.com/tc39/proposal-iterator-helpers)
