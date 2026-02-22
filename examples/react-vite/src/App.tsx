import { useState } from "react";
import { Yielded } from "@jenbuska/yielded";

function App() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<number[]>([]);

  const handleIncrement = () => {
    // Use Yielded to derive the new count and a list of numbers up to it
    const next = Yielded.from([count + 1]).first();
    const newItems = Yielded.from(
      (function* () {
        for (let i = 1; i <= next; i++) yield i;
      })(),
    )
      .map((n) => n * 2)
      .toArray();

    setCount(next);
    setItems(newItems);
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Yielded React Example</h1>
      <button id="increment-btn" onClick={handleIncrement}>
        Increment
      </button>
      <p>
        Count: <span id="count-display">{count}</span>
      </p>
      <ul id="items-list">
        {items.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
