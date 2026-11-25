import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateHeroScroll } from './hero-scroll-animation';

describe('hero scroll refresh', () => {
  let root: HTMLElement;
  let motion: gsap.MatchMedia;
  let notifyResize: () => void;
  let observer: jasmine.SpyObj<ResizeObserver>;

  const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  beforeEach(() => {
    const media = window.matchMedia('(prefers-reduced-motion: no-preference)');
    Object.defineProperty(media, 'matches', { value: true });
    spyOn(window, 'matchMedia').and.returnValue(media);
    observer = jasmine.createSpyObj('ResizeObserver', ['observe', 'disconnect']);
    spyOn(window, 'ResizeObserver').and.callFake(function (callback) {
      notifyResize = () => callback([], observer);
      return observer;
    });
    root = document.createElement('div');
    root.innerHTML = `
      <section class="hero-section">
        <div class="hero-layout"><h1 class="hero-headline">Hero copy</h1></div>
      </section>
    `;
    document.body.appendChild(root);
  });

  afterEach(() => {
    motion?.revert();
    root.remove();
  });

  it('refreshes once for both observed boxes per frame and cancels pending work on teardown', async () => {
    const refresh = spyOn(ScrollTrigger, 'refresh');
    const cancelFrame = spyOn(window, 'cancelAnimationFrame').and.callThrough();
    motion = animateHeroScroll(root);
    expect(observer.observe.calls.allArgs()).toEqual([
      [root.querySelector('.hero-section')!],
      [root.querySelector('.hero-layout')!],
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
    refresh.calls.reset();

    notifyResize();
    notifyResize();
    expect(refresh).not.toHaveBeenCalled();
    await nextFrame();
    expect(refresh).toHaveBeenCalledTimes(1);

    refresh.calls.reset();
    notifyResize();
    motion.revert();
    expect(cancelFrame).toHaveBeenCalled();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    notifyResize(); // Ignore a notification queued around teardown.
    await nextFrame();
    expect(refresh).not.toHaveBeenCalled();
  });
});
