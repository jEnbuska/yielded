const EMPTY_SLOT = Symbol("EMPTY_SLOT");

export function isEmptySlot<T>(value: T | symbol): value is symbol {
  return value === EMPTY_SLOT;
}

export function getEmptySlot() {
  return EMPTY_SLOT;
}
