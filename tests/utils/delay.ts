export async function delay<T>(value: T, ms: number): Promise<T> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  return value;
}
