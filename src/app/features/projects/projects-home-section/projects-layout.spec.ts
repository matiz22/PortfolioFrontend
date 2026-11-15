import { groupProjects, projectRowWeights } from './projects-layout';

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

  it('retains 65/35 expansion for pairs and equal tracks when resting', () => {
    expect(projectRowWeights(2)).toEqual([1, 1]);
    expect(projectRowWeights(2, 0)).toEqual([1.3, 0.7]);
    expect(projectRowWeights(2, 1)).toEqual([0.7, 1.3]);
  });

  it('gives the active card half of a three-card row in every position', () => {
    expect(projectRowWeights(3)).toEqual([1, 1, 1]);
    expect(projectRowWeights(3, 0)).toEqual([1.5, 0.75, 0.75]);
    expect(projectRowWeights(3, 1)).toEqual([0.75, 1.5, 0.75]);
    expect(projectRowWeights(3, 2)).toEqual([0.75, 0.75, 1.5]);
  });

  it('keeps singleton and invalid selections stable', () => {
    expect(projectRowWeights(1, 0)).toEqual([1]);
    expect(projectRowWeights(3, 3)).toEqual([1, 1, 1]);
    expect(projectRowWeights(0)).toEqual([]);
  });
});
