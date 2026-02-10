export function range(end: number): number[];
export function range(start: number, end: number): number[];

export function range(startOrEnd: number, end?: number): number[] {
  const start = end === undefined ? 0 : startOrEnd;
  end = end === undefined ? startOrEnd : end;
  const acc: number[] = [];
  for (let i = start; i < end; i++) {
    acc.push(i);
  }
  return acc;
}
