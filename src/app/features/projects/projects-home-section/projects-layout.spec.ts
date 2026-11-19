import { groupProjects } from './projects-layout';

describe('project row layout', () => {
  it('groups projects into pairs while preserving order', () => {
    expect(groupProjects([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('groups large-screen projects into threes and keeps incomplete final rows', () => {
    expect(groupProjects([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]]);
    expect(groupProjects([1, 2, 3, 4], 3)).toEqual([[1, 2, 3], [4]]);
    expect(groupProjects([], 3)).toEqual([]);
  });

  it('can regroup without losing or reordering projects', () => {
    const projects = Array.from({ length: 8 }, (_, index) => ({ id: index + 1 }));
    expect(groupProjects(groupProjects(projects, 2).flat(), 3).flat()).toEqual(projects);
    expect(groupProjects(groupProjects(projects, 3).flat(), 2).flat()).toEqual(projects);
  });
});
