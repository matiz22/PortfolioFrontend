export function uniquePortfolioItems<T extends { name: string }>(
  items: readonly T[],
  usedNames = new Set<string>(),
): T[] {
  return items.filter(({ name }) => {
    const key = name.trim().toLowerCase();
    if (!key || usedNames.has(key)) {
      return false;
    }
    usedNames.add(key);
    return true;
  });
}
