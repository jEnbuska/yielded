import { Yielded } from "@jenbuska/yielded";

// Sync pipeline: filter even numbers and double them
const evens = Yielded.from([1, 2, 3, 4, 5, 6])
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .toArray();

console.log("Evens x2:", evens); // [4, 8, 12]

// Chained operations: take first 3 odd numbers starting from 1
const odds = Yielded.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .filter((n) => n % 2 !== 0)
  .take(3)
  .toArray();

console.log("First 3 odds:", odds); // [1, 3, 5]

// Async pipeline: uppercase words from an async generator
const upper = await Yielded.from(
  (async function* () {
    yield "hello";
    yield "yielded";
    yield "world";
  })(),
)
  .map((s) => s.toUpperCase())
  .toArray();

console.log("Uppercased:", upper); // ["HELLO", "YIELDED", "WORLD"]

// groupBy: group numbers by even/odd
const grouped = Yielded.from([1, 2, 3, 4, 5])
  .groupBy((n) => (n % 2 === 0 ? "even" : "odd"));

console.log("Grouped:", grouped); // { odd: [1, 3, 5], even: [2, 4] }

console.log("All checks passed ✓");
