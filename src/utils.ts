export function intersection<T>(a: T[], b: T[]) {
  const aSet = new Set<T>(a);
  return b.filter((x) => aSet.has(x));
}
