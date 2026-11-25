import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateAboutMeScroll } from './about-me-scroll-animation';

describe('About Me scroll animation', () => {
  let root: HTMLElement;
  let section: HTMLElement;
  let stage: HTMLElement;
  let panels: HTMLElement[];
  let links: HTMLAnchorElement[];
  let fill: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let canAnimate: boolean;
  let isDesktop: boolean;
  let isTall: boolean;
  let stageHeight: number;
  let originalHeight: PropertyDescriptor | undefined;
  let originalUrl: string;

  beforeEach(() => {
    originalUrl = location.href;
    canAnimate = true;
    isDesktop = true;
    isTall = true;
    stageHeight = 900;
    originalHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 920 });
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: query.includes('min-width') ? isDesktop && isTall : canAnimate,
      });
      return media;
    });

    root = document.createElement('div');
    root.innerHTML = `
      <section class="about-section">
        <div class="about-shell">
          <header class="about-header">Services</header>
          <nav class="about-index">
            <span class="about-fill"></span>
            ${[0, 1, 2].map((index) => `
              <a class="about-index-link" href="#service-${index}">Service ${index}</a>
            `).join('')}
          </nav>
          <div class="about-panels">
            ${[0, 1, 2].map((index) => `
              <article class="about-panel" id="service-${index}" tabindex="-1">Service ${index}</article>
            `).join('')}
          </div>
        </div>
      </section>
    `;
    document.body.appendChild(root);
    section = root.querySelector('.about-section')!;
    stage = root.querySelector('.about-shell')!;
    panels = Array.from(root.querySelectorAll<HTMLElement>('.about-panel'));
    links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.about-index-link'));
    fill = root.querySelector('.about-fill')!;
    Object.defineProperty(stage, 'offsetHeight', { get: () => stageHeight });
  });

  afterEach(() => {
    history.replaceState(history.state, '', originalUrl);
    motion?.revert();
    motion = undefined;
    root.remove();
    if (originalHeight) {
      Object.defineProperty(window, 'innerHeight', originalHeight);
    }
  });

  function trigger(): ScrollTrigger {
    return ScrollTrigger.getAll().find((candidate) => candidate.trigger === stage)!;
  }

  function timeline(): gsap.core.Timeline {
    return trigger().animation as gsap.core.Timeline;
  }

  function stubIntersectionObserver() {
    const observer = jasmine.createSpyObj<IntersectionObserver>('observer', ['observe', 'disconnect']);
    let callback!: IntersectionObserverCallback;
    spyOn(window, 'IntersectionObserver').and.callFake(function (next) {
      callback = next;
      return observer;
    });
    return {
      observer,
      intersect: () => callback([{ isIntersecting: true } as IntersectionObserverEntry], observer),
    };
  }

  it('pins the full stage at the viewport edge before advancing services', () => {
    motion = animateAboutMeScroll(root);
    expect(section.classList.contains('about-is-pinned')).toBeTrue();
    expect(trigger().pin).toBe(stage);
    expect(trigger().vars.start).toBe('top top');
    expect(trigger().vars.scrub).toBeTrue();
    expect(timeline().duration()).toBeCloseTo(3.48, 2);
    expect(trigger().end - trigger().start).toBeCloseTo(2036, 0);
  });

  it('waits to pin when idle hydration finishes after the visitor has passed About', () => {
    const bounds = spyOn(root, 'getBoundingClientRect').and.returnValue({ bottom: 0 } as DOMRect);
    const { observer, intersect } = stubIntersectionObserver();

    motion = animateAboutMeScroll(root);
    expect(section.classList.contains('about-is-pinned')).toBeFalse();
    expect(observer.observe).toHaveBeenCalledOnceWith(root);

    bounds.and.callThrough();
    intersect();
    expect(section.classList.contains('about-is-pinned')).toBeTrue();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not replay a retained fragment when the deferred pin mounts on return', () => {
    history.replaceState(history.state, '', '#service-2');
    const bounds = spyOn(root, 'getBoundingClientRect').and.returnValue({ bottom: 0 } as DOMRect);
    const { intersect } = stubIntersectionObserver();
    motion = animateAboutMeScroll(root, false);
    const scroll = spyOn(window, 'scrollTo').and.callThrough();

    bounds.and.callThrough();
    intersect();

    expect(trigger().pin).toBe(stage);
    expect(scroll.calls.allArgs() as unknown[]).not.toContain([
      jasmine.objectContaining({ behavior: 'instant' }),
    ]);
    expect(document.activeElement).not.toBe(panels[2]);
  });

  it('keeps the first item visible on entry and after layout refreshes', () => {
    motion = animateAboutMeScroll(root);
    ScrollTrigger.refresh();
    timeline().progress(0);

    expect(Number(gsap.getProperty(panels[0], 'opacity'))).toBe(1);
    expect(Number(gsap.getProperty(panels[0], 'y'))).toBe(0);
    expect(panels[0].inert).toBeFalse();
    expect(panels[0].getAttribute('aria-hidden')).toBe('false');
    expect(links[0].getAttribute('aria-current')).toBe('step');

    timeline().time(0.9);
    expect(Number(gsap.getProperty(panels[0], 'opacity'))).toBe(1);
    expect(Number(gsap.getProperty(panels[1], 'opacity'))).toBe(0);
  });

  it('holds every service fully visible with a stationary progress rail', () => {
    motion = animateAboutMeScroll(root);
    const animation = timeline();

    for (let index = 0; index < panels.length; index++) {
      animation.time(animation.labels[`service-${index}`] + 0.5);
      expect(Number(gsap.getProperty(panels[index], 'opacity'))).toBe(1);
      expect(Number(gsap.getProperty(panels[index], 'y'))).toBe(0);
      expect(Number(gsap.getProperty(fill, 'scaleY'))).toBeCloseTo((index + 1) / 3, 3);
      expect(links[index].getAttribute('aria-current')).toBe('step');
      expect(panels[index].inert).toBeFalse();
      expect(panels[index].getAttribute('aria-hidden')).toBe('false');
      panels.forEach((panel, other) => {
        if (other !== index) {
          expect(Number(gsap.getProperty(panel, 'opacity'))).toBe(0);
          expect(panel.inert).toBeTrue();
        }
      });
    }
  });

  it('shows exactly one fully opaque service throughout transitions in either direction', () => {
    motion = animateAboutMeScroll(root);
    const times = [0.5, 1, 1.06, 1.119, 1.12, 1.18, 1.24, 2.24, 2.359, 2.36, 2.42, 2.48, 3];
    for (const time of [...times, ...[...times].reverse()]) {
      timeline().time(time);
      const visible = panels.filter((panel) => Number(gsap.getProperty(panel, 'opacity')) > 0);
      expect(visible.length).withContext(`At timeline time ${time}`).toBe(1);
      expect(Number(gsap.getProperty(visible[0], 'opacity'))).toBe(1);
    }
  });

  it('switches directly between readable panels at the transition boundary', () => {
    motion = animateAboutMeScroll(root);
    timeline().time(1.119);
    expect(Number(gsap.getProperty(panels[0], 'opacity'))).toBe(1);
    expect(Number(gsap.getProperty(panels[1], 'opacity'))).toBe(0);

    timeline().time(1.12);
    expect(Number(gsap.getProperty(panels[0], 'opacity'))).toBe(0);
    expect(Number(gsap.getProperty(panels[1], 'opacity'))).toBe(1);
  });

  it('lifts outgoing and incoming copy around the existing switch without dimming the active panel', () => {
    motion = animateAboutMeScroll(root);
    const animation = timeline();
    const offset = (panel: HTMLElement) => parseFloat(panel.style.getPropertyValue('--about-text-offset'));
    animation.time(1.06);
    expect(offset(panels[0])).toBeCloseTo(-3, 1);
    expect(Number(gsap.getProperty(panels[0], 'opacity'))).toBe(1);
    animation.time(1.18);
    expect(offset(panels[1])).toBeCloseTo(3, 1);
    expect(Number(gsap.getProperty(panels[1], 'opacity'))).toBe(1);
    animation.time(1.4);
    expect(offset(panels[1])).toBe(0);
    animation.time(1.06);
    expect(offset(panels[0])).toBeCloseTo(-3, 1);
  });

  it('restores the previous service and its accessible state when scrolling back', () => {
    motion = animateAboutMeScroll(root);
    timeline().progress(1);
    expect(links[2].getAttribute('aria-current')).toBe('step');

    timeline().time(0.5);
    expect(Number(gsap.getProperty(panels[0], 'opacity'))).toBe(1);
    expect(panels[0].inert).toBeFalse();
    expect(panels[2].inert).toBeTrue();
    expect(links[0].getAttribute('aria-current')).toBe('step');
    expect(links[2].hasAttribute('aria-current')).toBeFalse();
    expect(Number(gsap.getProperty(fill, 'scaleY'))).toBeCloseTo(1 / 3, 3);
  });

  it('takes index navigation into the selected service reading hold', () => {
    motion = animateAboutMeScroll(root);
    const scroll = spyOn(window, 'scrollTo');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    links[1].dispatchEvent(event);
    const time = timeline().labels['service-1'] + 0.35;
    const top = trigger().start + time / timeline().duration() *
      (trigger().end - trigger().start);

    expect(event.defaultPrevented).toBeTrue();
    expect(location.hash).toBe('#service-1');
    timeline().time(time);
    expect(document.activeElement).toBe(panels[1]);
    expect(scroll.calls.allArgs() as unknown[])
      .toContain([jasmine.objectContaining({ top, behavior: 'smooth' })]);
  });

  it('leaves modified index clicks to the browser', () => {
    motion = animateAboutMeScroll(root);
    const scroll = spyOn(window, 'scrollTo');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    links[1].dispatchEvent(event);
    expect(event.defaultPrevented).toBeFalse();
    expect(scroll).not.toHaveBeenCalled();
  });

  it('replays the current index fragment without another history entry', () => {
    motion = animateAboutMeScroll(root);
    history.replaceState(history.state, '', '#service-1');
    const push = spyOn(history, 'pushState');
    const scroll = spyOn(window, 'scrollTo');
    links[1].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(push).not.toHaveBeenCalled();
    expect(scroll).toHaveBeenCalled();
    timeline().time(timeline().labels['service-1'] + 0.35);
    expect(document.activeElement).toBe(panels[1]);
  });

  it('resolves an incoming service fragment to its pinned reading hold', () => {
    const { href } = location;
    const scroll = spyOn(window as { scrollTo(options: ScrollToOptions): void }, 'scrollTo');
    try {
      history.replaceState(history.state, '', '#service-2');
      motion = animateAboutMeScroll(root);
      const time = timeline().labels['service-2'] + 0.35;
      const top = trigger().start + time / timeline().duration() * (trigger().end - trigger().start);
      expect(scroll.calls.mostRecent().args[0]).toEqual({ top, behavior: 'instant' });
    } finally {
      history.replaceState(history.state, '', href);
    }
  });

  it('leaves scroll restoration to the router when motion remounts on a retained view', () => {
    const { href } = location;
    const scroll = spyOn(window as { scrollTo(options: ScrollToOptions): void }, 'scrollTo').and.callThrough();
    try {
      history.replaceState(history.state, '', '#service-2');
      motion = animateAboutMeScroll(root, false);
      expect(trigger().pin).toBe(stage);
      expect(scroll.calls.allArgs() as unknown[]).not.toContain([
        jasmine.objectContaining({ behavior: 'instant' }),
      ]);
      expect(document.activeElement).not.toBe(panels[2]);
    } finally {
      history.replaceState(history.state, '', href);
    }
  });

  it('returns to the same pinned service when an external fragment link is used again', () => {
    const { href } = location;
    const cta = document.createElement('a');
    cta.href = '#service-2';
    document.body.append(cta);
    try {
      motion = animateAboutMeScroll(root);
      const scroll = spyOn(window as { scrollTo(options: ScrollToOptions): void }, 'scrollTo');
      history.replaceState(history.state, '', '#service-2');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      const time = timeline().labels['service-2'] + 0.35;
      const top = trigger().start + time / timeline().duration() * (trigger().end - trigger().start);
      expect(scroll).toHaveBeenCalledOnceWith({ top, behavior: 'instant' });

      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      cta.dispatchEvent(click);
      expect(click.defaultPrevented).toBeTrue();
      expect(scroll.calls.mostRecent().args[0]).toEqual({ top, behavior: 'instant' });
      expect(scroll.calls.count()).toBe(2);
    } finally {
      cta.remove();
      history.replaceState(history.state, '', href);
    }
  });

  it('keeps mobile services in natural document flow', () => {
    isDesktop = false;
    motion = animateAboutMeScroll(root);
    expect(section.classList.contains('about-is-pinned')).toBeFalse();
    expect(trigger()).toBeUndefined();
    panels.forEach((panel) => {
      expect(panel.inert).toBeFalse();
      expect(panel.hasAttribute('aria-hidden')).toBeFalse();
      expect(panel.style.opacity).toBe('');
    });
  });

  it('does not pin on short desktop screens', () => {
    isTall = false;
    motion = animateAboutMeScroll(root);
    expect(section.classList.contains('about-is-pinned')).toBeFalse();
    expect(trigger()).toBeUndefined();
    expect(root.querySelector('.pin-spacer')).toBeNull();
  });

  it('keeps services in document flow if the stage is taller than the viewport', () => {
    stageHeight = window.innerHeight + 1;
    motion = animateAboutMeScroll(root);
    expect(section.classList.contains('about-is-pinned')).toBeFalse();
    expect(trigger()).toBeUndefined();
    expect(panels.every((panel) => !panel.inert)).toBeTrue();
  });

  it('restores native services when content outgrows the viewport and pins again when it fits', () => {
    let resized!: ResizeObserverCallback;
    let flush!: () => void;
    spyOn(window, 'ResizeObserver').and.callFake(function (callback) {
      resized = callback;
      return {
        observe: () => undefined,
        unobserve: () => undefined,
        disconnect: () => undefined,
      } satisfies ResizeObserver;
    });
    // Flush the scheduled fit check directly: real frames are at the mercy of
    // the headless compositor, while the decision itself is synchronous.
    spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      flush = () => callback(0);
      return 1;
    });
    motion = animateAboutMeScroll(root);
    stageHeight = window.innerHeight + 20;
    resized([], {} as ResizeObserver);
    flush();
    // The first overflowing check only schedules a confirmation pass.
    flush();
    expect(section.classList.contains('about-is-pinned')).toBeFalse();
    expect(trigger()).toBeUndefined();
    expect(panels.every((panel) => !panel.inert && !panel.hasAttribute('aria-hidden'))).toBeTrue();

    stageHeight = window.innerHeight - 20;
    resized([], {} as ResizeObserver);
    flush();
    expect(section.classList.contains('about-is-pinned')).toBeTrue();
    expect(trigger().pin).toBe(stage);
    expect(panels[0].inert).toBeFalse();
    expect(panels[1].inert).toBeTrue();
  });

  it('keeps every service static and readable for reduced motion', () => {
    canAnimate = false;
    motion = animateAboutMeScroll(root);
    expect(section.classList.contains('about-is-pinned')).toBeFalse();
    expect(trigger()).toBeUndefined();
    panels.forEach((panel) => {
      expect(panel.inert).toBeFalse();
      expect(panel.hasAttribute('aria-hidden')).toBeFalse();
      expect(panel.style.opacity).toBe('');
    });
  });

  it('restores markup and removes its pin and navigation listeners on cleanup', () => {
    const elsewhere = document.createElement('div');
    document.body.appendChild(elsewhere);
    const unrelated = ScrollTrigger.create({ trigger: elsewhere });
    motion = animateAboutMeScroll(root);
    timeline().time(1.75);
    motion.revert();
    motion = undefined;

    expect(section.classList.contains('about-is-pinned')).toBeFalse();
    expect(root.querySelector('.pin-spacer')).toBeNull();
    expect(trigger()).toBeUndefined();
    expect(ScrollTrigger.getAll()).toContain(unrelated);
    panels.forEach((panel) => {
      expect(panel.inert).toBeFalse();
      expect(panel.hasAttribute('aria-hidden')).toBeFalse();
      expect(panel.style.opacity).toBe('');
      expect(panel.style.transform).toBe('');
    });
    links.forEach((link) => expect(link.hasAttribute('aria-current')).toBeFalse());

    const scroll = spyOn(window, 'scrollTo');
    links[0].addEventListener('click', (event) => event.preventDefault(), { once: true });
    links[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(scroll).not.toHaveBeenCalled();
    unrelated.kill();
    elsewhere.remove();
  });
});
