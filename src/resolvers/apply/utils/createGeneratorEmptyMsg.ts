import type { IParallelResolverName } from "../../parallel/ParallelGeneratorResolver.ts";

export function createGeneratorEmptyMsg(
  yielded: "Yielded" | "AsyncYielded" | "ParallelYielded",
  method: IParallelResolverName,
) {
  return `${yielded}.${method} requires an initial value or an iterator that is not done.`;
}
