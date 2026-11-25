import { projectRowOffsets, projectRowWeights } from './projects-layout';

describe('project grid layout', () => {
  it('uses equal tracks until a card is active', () => {
    expect(projectRowWeights(2)).toEqual([1, 1]);
    expect(projectRowWeights(3)).toEqual([1, 1, 1]);
    expect(projectRowWeights(3, 3)).toEqual([1, 1, 1]);
    expect(projectRowWeights(1, 0)).toEqual([1]);
  });

  it('gives the active card 65% of a pair and 50% of a trio', () => {
    expect(projectRowWeights(2, 1)).toEqual([0.7, 1.3]);
    expect(projectRowWeights(3, 1)).toEqual([0.75, 1.5, 0.75]);
  });

  it('keeps the same outside edges and gaps in an expanded row', () => {
    expect(projectRowOffsets(1200, 3, 1)).toEqual([
      { inline: 0, width: -100 },
      { inline: -100, width: 200 },
      { inline: 100, width: -100 },
    ]);
    expect(projectRowOffsets(1200, 1, 0)).toEqual([{ inline: 0, width: 0 }]);
  });
});
