import { gsap } from 'gsap';
import { animateSectionAction } from './section-action-magnet';

describe('section action magnet', () => {
  let root: HTMLAnchorElement;
  let surface: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let finePointer: boolean;
  let canAnimate: boolean;

  beforeEach(() => {
    finePointer = true;
    canAnimate = true;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', { get: () => finePointer && canAnimate });
      return media;
    });
    root = document.createElement('a');
    root.href = '#destination';
    root.innerHTML = '<span class="section-action-surface">View all projects</span>';
    document.body.appendChild(root);
    surface = root.firstElementChild as HTMLElement;
    spyOn(root, 'getBoundingClientRect').and.returnValue({
      left: 100, top: 100, width: 200, height: 60,
    } as DOMRect);
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    root.remove();
  });

  function move(pointerType = 'mouse'): void {
    root.dispatchEvent(new PointerEvent('pointermove', {
      pointerType, clientX: 295, clientY: 159,
    }));
  }

  function tween(): gsap.core.Tween {
    return gsap.getTweensOf(surface).find((candidate) => candidate.duration() > 0)!;
  }

  it('moves only the inner surface, clamps travel, and uses automatic overwrite', () => {
    motion = animateSectionAction(root, 8);
    move();
    expect(tween().vars.overwrite).toBe('auto');
    expect(tween().duration()).toBe(0.32);
    tween().progress(1);
    expect(Number(gsap.getProperty(surface, 'x'))).toBe(8);
    expect(Number(gsap.getProperty(surface, 'y'))).toBe(8);
    expect(root.style.transform).toBe('');
  });

  it('uses less attraction for the continuation variant', () => {
    motion = animateSectionAction(root, 4);
    move();
    tween().progress(1);
    expect(Number(gsap.getProperty(surface, 'x'))).toBe(4);
    expect(Number(gsap.getProperty(surface, 'y'))).toBe(4);
  });

  it('returns smoothly and removes inline transforms on pointer exit', () => {
    motion = animateSectionAction(root, 8);
    move();
    tween().progress(1);
    root.dispatchEvent(new PointerEvent('pointerleave'));
    expect(tween().vars.overwrite).toBe('auto');
    expect(tween().duration()).toBe(0.5);
    tween().progress(1);
    expect(surface.style.transform).toBe('');
  });

  it('cancels an unfinished return when the pointer re-enters', () => {
    motion = animateSectionAction(root, 8);
    move();
    tween().progress(1);
    root.dispatchEvent(new PointerEvent('pointerleave'));
    const returning = tween();
    returning.progress(0.25);
    move();
    expect(returning.parent).toBeNull();
    tween().progress(1);
    expect(Number(gsap.getProperty(surface, 'x'))).toBe(8);
  });

  it('settles immediately for keyboard focus and does not chase a focused link', () => {
    motion = animateSectionAction(root, 8);
    move();
    tween().progress(0.5);
    root.focus();
    expect(surface.style.transform).toBe('');
    expect(gsap.getTweensOf(surface).length).toBe(0);
    move();
    expect(gsap.getTweensOf(surface).length).toBe(0);
  });

  for (const setting of ['reduced motion', 'coarse pointer'] as const) {
    it(`keeps ${setting} interactions static`, () => {
      canAnimate = setting !== 'reduced motion';
      finePointer = setting !== 'coarse pointer';
      motion = animateSectionAction(root, 8);
      move();
      expect(surface.style.transform).toBe('');
      expect(gsap.getTweensOf(surface).length).toBe(0);
    });
  }

  it('ignores touch events even on a hybrid device with a mouse', () => {
    motion = animateSectionAction(root, 8);
    move('touch');
    expect(surface.style.transform).toBe('');
    expect(gsap.getTweensOf(surface).length).toBe(0);
  });

  it('cleans up pending returns, styles, and event listeners', () => {
    motion = animateSectionAction(root, 8);
    move();
    tween().progress(1);
    root.dispatchEvent(new PointerEvent('pointerleave'));
    motion.revert();
    move();
    root.dispatchEvent(new PointerEvent('pointerleave'));
    expect(surface.style.transform).toBe('');
    expect(gsap.getTweensOf(surface).length).toBe(0);
  });

  it('reverts motion if the user changes their motion preference', () => {
    motion = animateSectionAction(root, 8);
    move();
    tween().progress(1);
    canAnimate = false;
    gsap.matchMediaRefresh();
    expect(surface.style.transform).toBe('');
    move();
    expect(gsap.getTweensOf(surface).length).toBe(0);
  });
});
