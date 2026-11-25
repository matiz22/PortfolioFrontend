import {
  chapterPosition,
  HERO_PALETTE,
  mixPalettes,
  type GrainPalette,
  watchGrainGradientPalette,
} from './grain-gradient-palette';

describe('grain chapter palettes', () => {
  const tops = [0, 1000, 2100];
  const height = 900;
  const offset = 96;

  it('holds a palette inside each section and eases through the boundary window', () => {
    const at = (y: number) => chapterPosition(tops, y, height, offset, false);
    // The first blend starts when the next chapter is 60% down the viewport.
    expect(at(460)).toBe(0);
    expect(at(571)).toBeCloseTo(0.15625);
    expect(at(682)).toBeCloseTo(0.5);
    expect(at(793)).toBeCloseTo(0.84375);
    expect(at(904)).toBe(1);
    expect(at(1200)).toBe(1);
    expect(at(2004)).toBe(2);
  });

  it('holds between close boundaries and never blends in reduced motion', () => {
    expect(chapterPosition([0, 1000, 1100], 920, height, offset, false)).toBe(1);
    expect(chapterPosition(tops, 681, height, offset, true)).toBe(0);
    expect(chapterPosition(tops, 682, height, offset, true)).toBe(1);
    expect(chapterPosition(tops, 1900, height, offset, true)).toBe(2);
  });

  it('interpolates all shader colors, not just the two fallback accents', () => {
    const blue: GrainPalette = [[20, 60, 140], [70, 130, 230], [45, 170, 220], [25, 95, 150]];
    expect(mixPalettes(HERO_PALETTE, blue, 0.5)).toEqual([
      [10, 76, 98.5], [35, 170.5, 178.5], [22.5, 180.5, 214.5], [12.5, 111, 142],
    ]);
  });

  it('uses one frame per scroll batch, reverses the palette, and remeasures on resize', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-grain-chapter="hero" style="scroll-margin-top: 96px"></div>
      <div data-grain-chapter="work"></div>
    `;
    document.body.appendChild(root);
    let y = 0;
    let workTop = 1000;
    let pending: FrameRequestCallback | undefined;
    spyOnProperty(window, 'scrollY', 'get').and.callFake(() => y);
    spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    const frame = spyOn(window, 'requestAnimationFrame').and.callFake(callback => {
      pending = callback;
      return 1;
    });
    const cancel = spyOn(window, 'cancelAnimationFrame');
    const heroBounds = spyOn(root.children[0], 'getBoundingClientRect').and.callFake(() => new DOMRect(0, -y));
    spyOn(root.children[1], 'getBoundingClientRect').and.callFake(() => new DOMRect(0, workTop - y));
    const render = jasmine.createSpy<(palette: GrainPalette) => void>('palette');
    const stop = watchGrainGradientPalette(root, render);
    try {
      expect(render).toHaveBeenCalledOnceWith(HERO_PALETTE);
      y = 930;
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      expect(frame).toHaveBeenCalledTimes(1);
      pending!(0);
      expect(render.calls.mostRecent().args[0]).not.toEqual(HERO_PALETTE);
      expect(heroBounds).toHaveBeenCalledTimes(1);

      y = 0;
      window.dispatchEvent(new Event('scroll'));
      pending!(0);
      expect(render.calls.mostRecent().args[0]).toBe(HERO_PALETTE);
      expect(heroBounds).toHaveBeenCalledTimes(1);

      workTop = 1900;
      y = 930;
      window.dispatchEvent(new Event('resize'));
      pending!(0);
      expect(heroBounds).toHaveBeenCalledTimes(2);
      expect(render).toHaveBeenCalledTimes(3);
      window.dispatchEvent(new Event('scroll'));
    } finally {
      stop();
      root.remove();
    }
    expect(cancel).toHaveBeenCalledWith(1);
    frame.calls.reset();
    window.dispatchEvent(new Event('scroll'));
    expect(frame).not.toHaveBeenCalled();
  });
});
