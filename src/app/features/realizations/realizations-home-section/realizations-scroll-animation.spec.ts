import { gsap } from 'gsap';
import { animateRealizationsScroll } from './realizations-scroll-animation';

describe('realizations optional visual motion', () => {
  let root: HTMLElement;
  let gallery: HTMLElement;
  let previous: HTMLButtonElement;
  let next: HTMLButtonElement;
  let motion: gsap.MatchMedia | undefined;
  let scrollTo: jasmine.Spy;
  let reportProgress: jasmine.Spy;
  let wide: boolean;
  let desktop: boolean;
  let canAnimate: boolean;

  const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  beforeEach(() => {
    wide = true;
    desktop = false;
    canAnimate = false;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      const matches = query === '(min-width: 48rem)' ? wide
        : query.includes('min-width') ? desktop
        : canAnimate;
      Object.defineProperty(media, 'matches', { value: matches });
      return media;
    });
    root = document.createElement('div');
    root.innerHTML = `
      <section class="realizations-section">
        <div class="realizations-stage-wrap">
          <div class="realizations-stage">
            <div class="realizations-gallery">
              <div class="realizations-track">
                <article class="realization-showcase">First</article>
                <article class="realization-showcase">Second</article>
                <article class="realization-showcase">Third</article>
              </div>
            </div>
            <span class="realizations-rail-fill"></span>
            <button class="realizations-nav-prev">Previous</button>
            <button class="realizations-nav-next">Next</button>
          </div>
        </div>
      </section>
    `;
    document.body.appendChild(root);
    gallery = root.querySelector<HTMLElement>('.realizations-gallery')!;
    previous = root.querySelector<HTMLButtonElement>('.realizations-nav-prev')!;
    next = root.querySelector<HTMLButtonElement>('.realizations-nav-next')!;
    Object.defineProperties(gallery, {
      clientWidth: { value: 300, configurable: true },
      scrollWidth: { value: 840, configurable: true },
      scrollLeft: { value: 0, writable: true },
    });
    root.querySelectorAll('.realization-showcase').forEach((card, index) => {
      Object.defineProperty(card, 'offsetLeft', { value: index * 300, configurable: true });
      Object.defineProperty(card, 'offsetWidth', { value: 240 });
    });
    scrollTo = spyOn(gallery, 'scrollTo');
    reportProgress = jasmine.createSpy('reportPinnedProgress');
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    root.remove();
  });

  function scroll(left: number): void {
    gallery.scrollLeft = left;
    gallery.dispatchEvent(new Event('scroll'));
  }

  function edgeAlpha(): number {
    return Number(gallery.style.getPropertyValue('--realizations-edge-alpha'));
  }

  it('leaves phone swipe rails to the browser even when motion is allowed', () => {
    wide = false;
    canAnimate = true;
    motion = animateRealizationsScroll(root, reportProgress);
    scroll(270);
    next.click();

    expect(scrollTo).not.toHaveBeenCalled();
    expect(gallery.style.getPropertyValue('--realizations-edge-alpha')).toBe('');
    expect(gsap.getTweensOf(root.querySelectorAll('.realization-showcase'))).toEqual([]);
  });

  it('removes the right-edge fade near the last card and restores it scrolling back', async () => {
    motion = animateRealizationsScroll(root, reportProgress);
    expect(edgeAlpha()).toBeCloseTo(0.28, 3);
    scroll(472.5);
    await nextFrame();
    expect(edgeAlpha()).toBeCloseTo(0.64, 3);
    scroll(540);
    await nextFrame();
    expect(edgeAlpha()).toBe(1);
    scroll(600); // Elastic overscroll must not darken the final card again.
    await nextFrame();
    expect(edgeAlpha()).toBe(1);
    scroll(0);
    await nextFrame();
    expect(edgeAlpha()).toBeCloseTo(0.28, 3);
  });

  it('does not veil a gallery where all the cards fit', () => {
    Object.defineProperty(gallery, 'clientWidth', { value: 840 });
    motion = animateRealizationsScroll(root, reportProgress);
    expect(edgeAlpha()).toBe(1);
  });

  it('clears and restores the fade with the desktop scrub', async () => {
    desktop = true;
    canAnimate = true;
    let top = 0;
    const wrap = root.querySelector<HTMLElement>('.realizations-stage-wrap')!;
    Object.defineProperty(wrap.firstElementChild, 'offsetHeight', { value: window.innerHeight });
    spyOn(wrap, 'getBoundingClientRect').and.callFake(() => ({ top } as DOMRect));
    motion = animateRealizationsScroll(root, reportProgress);
    expect(root.querySelector('.realizations-is-pinned')).not.toBeNull();
    expect(reportProgress).toHaveBeenCalledWith(0);
    expect(edgeAlpha()).toBeCloseTo(0.28, 3);

    const finishScroll = async () => {
      window.dispatchEvent(new Event('scroll'));
      await nextFrame();
      gsap.getTweensOf(gallery).forEach((tween) => tween.progress(1));
    };
    top = -702; // 162px leading hold + 540px horizontal overflow.
    await finishScroll();
    expect(edgeAlpha()).toBe(1);
    expect(reportProgress).toHaveBeenCalledWith(1);
    top = 0;
    await finishScroll();
    expect(edgeAlpha()).toBeCloseTo(0.28, 3);
  });

  it('keeps the native gallery controls when the stage is taller than the viewport', () => {
    desktop = true;
    canAnimate = true;
    Object.defineProperty(root.querySelector('.realizations-stage'), 'offsetHeight', {
      value: window.innerHeight + 1,
    });
    motion = animateRealizationsScroll(root, reportProgress);
    expect(root.querySelector('.realizations-is-pinned')).toBeNull();
    expect(reportProgress).not.toHaveBeenCalled();
  });

  it('does not bind navigation controls in the optional motion module', () => {
    motion = animateRealizationsScroll(root, reportProgress);
    previous.click();
    next.click();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(reportProgress).not.toHaveBeenCalled();
    expect(root.querySelector<HTMLElement>('.realizations-rail-fill')!.style.transform).toBe('');
  });

  it('does not pin a single card with no horizontal overflow', () => {
    desktop = true;
    canAnimate = true;
    const cards = root.querySelectorAll('.realization-showcase');
    cards[1].remove();
    cards[2].remove();
    Object.defineProperty(gallery, 'scrollWidth', { value: 300 });
    motion = animateRealizationsScroll(root, reportProgress);
    expect(root.querySelector('.realizations-is-pinned')).toBeNull();
    expect(reportProgress).not.toHaveBeenCalled();
    expect(edgeAlpha()).toBe(1);
  });

  it('rechecks pin eligibility as stage content grows and shrinks', async () => {
    desktop = true;
    canAnimate = true;
    let stageHeight = window.innerHeight;
    Object.defineProperty(root.querySelector('.realizations-stage'), 'offsetHeight', {
      get: () => stageHeight,
    });
    motion = animateRealizationsScroll(root, reportProgress);
    expect(root.querySelector('.realizations-is-pinned')).not.toBeNull();
    const resize = async () => {
      window.dispatchEvent(new Event('resize'));
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    };
    stageHeight += 1;
    await resize();
    // The first overflowing check schedules a confirmation pass before releasing.
    await resize();
    expect(root.querySelector('.realizations-is-pinned')).toBeNull();
    expect(reportProgress).toHaveBeenCalledWith(null);
    expect(root.querySelector<HTMLElement>('.realizations-stage-wrap')!.style.height).toBe('');

    stageHeight -= 1;
    await resize();
    expect(root.querySelector('.realizations-is-pinned')).not.toBeNull();
    expect(reportProgress.calls.mostRecent().args[0]).not.toBeNull();
    motion.revert();
    expect(reportProgress.calls.mostRecent().args[0]).toBeNull();
    expect(root.querySelector<HTMLElement>('.realizations-track')!.style.transform).toBe('');
  });

  it('batches native scroll work, refreshing cached width only after geometry changes', async () => {
    let width = 300;
    const readWidth = jasmine.createSpy('clientWidth').and.callFake(() => width);
    const observer = jasmine.createSpyObj<ResizeObserver>('observer', ['observe', 'disconnect']);
    let notifyResize!: () => void;
    spyOn(window, 'ResizeObserver').and.callFake(function (callback) {
      notifyResize = () => callback([], observer);
      return observer;
    });
    Object.defineProperty(gallery, 'clientWidth', { get: readWidth });
    motion = animateRealizationsScroll(root, reportProgress);
    readWidth.calls.reset();

    scroll(100);
    scroll(270);
    scroll(540);
    expect(edgeAlpha()).toBeCloseTo(0.28, 3);
    await nextFrame();
    expect(edgeAlpha()).toBe(1);
    expect(readWidth).not.toHaveBeenCalled();

    width = 255;
    notifyResize();
    notifyResize();
    await nextFrame();
    expect(readWidth).toHaveBeenCalledTimes(1);
    expect(edgeAlpha()).toBeLessThan(1);
  });

  it('batches pinned geometry and progress, and cancels a pending scroll update on cleanup', async () => {
    desktop = true;
    canAnimate = true;
    let top = 0;
    const wrap = root.querySelector<HTMLElement>('.realizations-stage-wrap')!;
    Object.defineProperty(wrap.firstElementChild, 'offsetHeight', { value: window.innerHeight });
    const readTop = spyOn(wrap, 'getBoundingClientRect').and.callFake(() => ({ top } as DOMRect));
    const card = root.querySelector('.realization-showcase')!;
    const readCardOffset = jasmine.createSpy('offsetLeft').and.returnValue(0);
    Object.defineProperty(card, 'offsetLeft', { get: readCardOffset });
    // Use explicit resize events to separate the initial observer delivery from the scroll burst.
    spyOn(window, 'ResizeObserver').and.callFake(function () {
      return jasmine.createSpyObj<ResizeObserver>('observer', ['observe', 'disconnect']);
    });
    motion = animateRealizationsScroll(root, reportProgress);
    readTop.calls.reset();
    readCardOffset.calls.reset();
    reportProgress.calls.reset();

    top = -300;
    for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('scroll'));
    expect(reportProgress).not.toHaveBeenCalled();
    await nextFrame();
    expect(readTop).toHaveBeenCalledTimes(1);
    expect(readCardOffset).not.toHaveBeenCalled();
    expect(reportProgress).toHaveBeenCalledOnceWith(138 / 540);

    window.dispatchEvent(new Event('resize'));
    await nextFrame();
    expect(readCardOffset).toHaveBeenCalledTimes(1);

    readTop.calls.reset();
    top = -650;
    window.dispatchEvent(new Event('scroll'));
    motion.revert();
    await nextFrame();
    expect(readTop).not.toHaveBeenCalled();
    expect(reportProgress.calls.mostRecent().args).toEqual([null]);
  });

  it('restores edge styles and removes visual listeners on cleanup', async () => {
    motion = animateRealizationsScroll(root, reportProgress);
    scroll(540);
    motion.revert();
    next.click();
    await nextFrame();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(root.querySelector<HTMLElement>('.realizations-rail-fill')!.style.transform).toBe('');
    expect(gallery.style.getPropertyValue('--realizations-edge-alpha')).toBe('');
  });

  it('preserves a pre-existing inline edge setting on cleanup', () => {
    gallery.style.setProperty('--realizations-edge-alpha', '0.8', 'important');
    motion = animateRealizationsScroll(root, reportProgress);
    motion.revert();
    expect(gallery.style.getPropertyValue('--realizations-edge-alpha')).toBe('0.8');
    expect(gallery.style.getPropertyPriority('--realizations-edge-alpha')).toBe('important');
  });
});
