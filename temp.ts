import { Yielded } from "./src";

Yielded.from<number>([])
  .parallel(2)
  .reduce((acc, next) => acc + next)
  .catch((e) => {
    console.log(e);
  });
