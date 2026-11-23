export const THREE_PROJECTS_QUERY = '(min-width: 80rem)';

export function groupProjects<T>(projects: readonly T[], columns: 2 | 3): T[][] {
  return Array.from({ length: Math.ceil(projects.length / columns) }, (_, index) =>
    projects.slice(index * columns, (index + 1) * columns),
  );
}

// Keep the total track weight constant so only the split within the row changes.
export function projectRowWeights(count: number, activeIndex = -1): number[] {
  const expanded = count === 3 ? 1.5 : 1.3;
  const compact = count === 3 ? 0.75 : 0.7;
  return Array.from({ length: count }, (_, index) =>
    count < 2 || activeIndex < 0 || activeIndex >= count
      ? 1
      : index === activeIndex ? expanded : compact,
  );
}
