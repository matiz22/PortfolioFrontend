// Keep the total track weight constant so only the split within a row changes.
export function projectRowWeights(count: number, activeIndex = -1): number[] {
  const expanded = count === 3 ? 1.5 : 1.3;
  const compact = count === 3 ? 0.75 : 0.7;
  return Array.from({ length: count }, (_, index) =>
    count < 2 || activeIndex < 0 || activeIndex >= count
      ? 1
      : index === activeIndex ? expanded : compact,
  );
}

// Redistribute width within one row without moving the grid slots themselves.
export function projectRowOffsets(available: number, count: number, activeIndex: number) {
  const base = available / count;
  let inline = 0;
  return projectRowWeights(count, activeIndex).map((weight) => {
    const width = base * (weight - 1);
    const offset = { inline, width };
    inline += width;
    return offset;
  });
}
