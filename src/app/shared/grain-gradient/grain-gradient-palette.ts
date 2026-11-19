type Rgb = readonly [number, number, number];
export type GrainPalette = readonly [Rgb, Rgb, Rgb, Rgb];

export const GRAIN_CHAPTER_PALETTES = {
  hero: [[0, 92, 57], [0, 211, 127], [0, 191, 209], [0, 127, 134]],
  about: [[0, 78, 68], [23, 179, 147], [57, 193, 177], [0, 109, 116]],
  work: [[14, 55, 141], [67, 128, 231], [43, 169, 221], [24, 94, 152]],
  projects: [[65, 35, 130], [143, 98, 223], [118, 111, 228], [80, 54, 158]],
  certifications: [[113, 69, 19], [205, 146, 55], [196, 162, 83], [139, 93, 39]],
  experience: [[34, 48, 128], [85, 105, 212], [92, 127, 217], [54, 71, 152]],
  education: [[99, 34, 100], [173, 79, 146], [159, 96, 174], [106, 52, 127]],
  contact: [[0, 86, 54], [39, 185, 120], [61, 177, 151], [0, 118, 98]],
} as const satisfies Record<string, GrainPalette>;

export type GrainChapter = keyof typeof GRAIN_CHAPTER_PALETTES;

export const HERO_PALETTE: GrainPalette = GRAIN_CHAPTER_PALETTES.hero;

// Reuse the brighter glow as a stable chapter accent, independent of the scroll blend.
export const GRAIN_CHAPTER_ACCENTS = Object.fromEntries(
  Object.entries(GRAIN_CHAPTER_PALETTES).map(([chapter, [, accent]]) => [chapter, `rgb(${accent.join(' ')})`]),
) as Record<GrainChapter, string>;

function paletteOf(chapter: string): GrainPalette | undefined {
  return Object.hasOwn(GRAIN_CHAPTER_PALETTES, chapter)
    ? GRAIN_CHAPTER_PALETTES[chapter as GrainChapter]
    : undefined;
}

export function mixPalettes(from: GrainPalette, to: GrainPalette, amount: number): GrainPalette {
  const mix = (a: Rgb, b: Rgb): Rgb => [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ];
  return [mix(from[0], to[0]), mix(from[1], to[1]), mix(from[2], to[2]), mix(from[3], to[3])];
}

/** A fractional chapter index represents a blend between two adjacent chapters. */
export function chapterPosition(
  tops: readonly number[],
  scrollY: number,
  viewportHeight: number,
  anchorOffset: number,
  reduceMotion: boolean,
): number {
  const blendWidth = Math.max(1, viewportHeight * 0.6 - anchorOffset);
  for (let i = 1; i < tops.length; i++) {
    const end = tops[i] - anchorOffset;
    if (scrollY >= end) {
      continue;
    }
    // Short chapters still get a stable palette; adjacent blends never overlap.
    const width = Math.min(blendWidth, (tops[i] - tops[i - 1]) * 0.7);
    const start = end - width;
    if (scrollY <= start) {
      return i - 1;
    }
    const t = (scrollY - start) / width;
    return reduceMotion ? (t < 0.5 ? i - 1 : i) : i - 1 + t * t * (3 - 2 * t);
  }
  return Math.max(0, tops.length - 1);
}

export function watchGrainGradientPalette(
  root: HTMLElement,
  onPalette: (palette: GrainPalette) => void,
): () => void {
  const view = root.ownerDocument.defaultView;
  if (!view) {
    return () => {};
  }
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-grain-chapter]'))
    .flatMap((section) => {
      const palette = paletteOf(section.dataset['grainChapter'] ?? '');
      return palette ? [{ section, palette }] : [];
    });
  if (!chapters.length) {
    return () => {};
  }

  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  let frame: number | undefined;
  let tops: number[] = [];
  let anchorOffset = 0;
  let measure = true;
  let lastPosition = -1;

  const update = () => {
    frame = undefined;
    if (!root.isConnected || root.ownerDocument.hidden) {
      return;
    }
    const { scrollY, innerHeight } = view;
    if (measure) {
      // The wrappers do not pin; their size includes any spacing added inside them.
      tops = chapters.map(({ section }) => section.getBoundingClientRect().top + scrollY);
      anchorOffset = parseFloat(view.getComputedStyle(chapters[0].section).scrollMarginTop) || 0;
      measure = false;
    }

    const position = chapterPosition(tops, scrollY, innerHeight, anchorOffset, reducedMotion.matches);
    if (position === lastPosition) {
      return;
    }
    lastPosition = position;
    const chapter = Math.floor(position);
    const from = chapters[chapter].palette;
    onPalette(position === chapter ? from : mixPalettes(from, chapters[chapter + 1].palette, position - chapter));
  };

  const requestUpdate = () => {
    if (frame === undefined && root.isConnected && !root.ownerDocument.hidden) {
      frame = view.requestAnimationFrame(update);
    }
  };
  const requestMeasure = () => {
    measure = true;
    requestUpdate();
  };

  const observer = view.ResizeObserver ? new view.ResizeObserver(requestMeasure) : undefined;
  chapters.forEach(({ section }) => observer?.observe(section, { box: 'border-box' }));
  view.addEventListener('scroll', requestUpdate, { passive: true });
  view.addEventListener('resize', requestMeasure);
  root.ownerDocument.addEventListener('visibilitychange', requestMeasure);
  reducedMotion.addEventListener('change', requestUpdate);
  update();

  return () => {
    observer?.disconnect();
    view.removeEventListener('scroll', requestUpdate);
    view.removeEventListener('resize', requestMeasure);
    root.ownerDocument.removeEventListener('visibilitychange', requestMeasure);
    reducedMotion.removeEventListener('change', requestUpdate);
    if (frame !== undefined) {
      view.cancelAnimationFrame(frame);
    }
  };
}
