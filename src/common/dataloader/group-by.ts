/**
 * DataLoader must return one entry per requested key, in the same order.
 * Batched queries come back as a flat list, so we regroup them here.
 */
export function groupByKey<T, K extends string>(
  rows: readonly T[],
  keys: readonly K[],
  keyOf: (row: T) => K,
): T[][] {
  const buckets = new Map<K, T[]>();
  for (const key of keys) {
    buckets.set(key, []);
  }
  for (const row of rows) {
    buckets.get(keyOf(row))?.push(row);
  }
  return keys.map((key) => buckets.get(key) ?? []);
}
