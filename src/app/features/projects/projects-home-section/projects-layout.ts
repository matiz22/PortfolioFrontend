export const THREE_PROJECTS_QUERY = '(min-width: 80rem)';

export function groupProjects<T>(projects: readonly T[], columns: 2 | 3): T[][] {
  return Array.from({ length: Math.ceil(projects.length / columns) }, (_, index) =>
    projects.slice(index * columns, (index + 1) * columns),
  );
}
