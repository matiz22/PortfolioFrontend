import { gsap } from 'gsap';
import { animatePortfolioHero } from './portfolio-hero-motion';

describe('Portfolio hero entrance', () => {
  let root: HTMLElement;
  let desktop: boolean;
  let reducedMotion: boolean;
  let revert: (() => void) | undefined;

  beforeEach(() => {
    desktop = true;
    reducedMotion = false;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: query.includes('prefers-reduced-motion') ? !reducedMotion : desktop,
      });
      return media;
    });

    root = document.createElement('section');
    root.innerHTML = `
      <div data-case-copy><h1>A case study</h1><p>A short summary.</p></div>
      <div data-case-actions><a href="#client">Visit client</a></div>
      <figure class="case-preview"><img alt="The completed design"></figure>
    `;
    document.body.appendChild(root);
  });

  afterEach(() => {
    revert?.();
    revert = undefined;
    root.remove();
  });

  function tween(selector: string): gsap.core.Tween {
    return gsap.getTweensOf(root.querySelector(selector))[0];
  }

  it('lets the preview lead and animates the artwork independently of the frame', () => {
    revert = animatePortfolioHero(root);
    const frame = tween('.case-preview');
    const artwork = tween('img');
    const copy = tween('[data-case-copy]');
    const actions = tween('[data-case-actions]');
    const hero = frame.parent!;
    expect(artwork.parent).toBe(hero);
    expect(copy.parent).toBe(hero);
    expect(actions.parent).toBe(hero);
    expect(frame.startTime()).toBeLessThan(artwork.startTime());
    expect(artwork.startTime()).toBeLessThan(copy.startTime());
    expect(copy.startTime()).toBeLessThan(actions.startTime());
    expect(hero.duration()).toBeCloseTo(0.74, 2);

    hero.progress(1);
    for (const element of root.querySelectorAll<HTMLElement>('div, figure, img')) {
      expect(element.style.transform).toBe('');
      expect(element.style.opacity).toBe('');
    }
  });

  it('lets text lead on mobile and clears the animation if the user navigates away', () => {
    desktop = false;
    revert = animatePortfolioHero(root);
    const copy = tween('[data-case-copy]');
    const frame = tween('.case-preview');
    expect(copy.startTime()).toBeLessThan(frame.startTime());
    copy.parent!.progress(0.4);

    revert();
    revert = undefined;
    expect(tween('[data-case-copy]')).toBeUndefined();
    expect(root.querySelector<HTMLElement>('[data-case-copy]')!.style.transform).toBe('');
    expect(root.querySelector<HTMLElement>('.case-preview')!.style.opacity).toBe('');
  });

  it('keeps the hero unchanged when reduced motion is preferred', () => {
    reducedMotion = true;
    const initial = root.innerHTML;
    revert = animatePortfolioHero(root);

    expect(root.innerHTML).toBe(initial);
    expect(tween('.case-preview')).toBeUndefined();
    expect(tween('[data-case-copy]')).toBeUndefined();
  });
});
