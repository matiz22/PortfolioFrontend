import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateAboutMeScroll } from '../../about-me/about-me-section/about-me-scroll-animation';
import { animateJobsTimeline } from './jobs-timeline-animation';

describe('jobs timeline animation', () => {
  let root: HTMLElement;
  let section: HTMLElement;
  let stage: HTMLElement;
  let viewport: HTMLElement;
  let track: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let wide: boolean;
  let mobile: boolean;
  let canAnimate: boolean;
  let trackWidth: number;
  let shellHeight: number;
  let originalHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    wide = true;
    mobile = false;
    canAnimate = true;
    trackWidth = 2400;
    shellHeight = 1000;
    // Karma's test iframe may have zero height; use a deterministic desktop viewport.
    originalHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: query.includes('min-width') ? wide : query.includes('width <') ? mobile : canAnimate,
      });
      return media;
    });

    root = document.createElement('div');
    root.innerHTML = `
      <section class="jobs-section">
        <div class="jobs-shell"><div class="jobs-stage">
        <header class="jobs-header">
          <div class="jobs-copy"><h2>Work Experience</h2><p>Past and current roles.</p></div>
          <a class="jobs-viewall" href="#jobs">View full work history</a>
        </header>
        <div class="jobs-viewport">
          <div class="jobs-track">
            <div class="jobs-rail"><span class="jobs-rail-fill"></span></div>
            <ol class="jobs-list">
              ${[0, 1, 2, 3].map((index) => `
                <li class="jobs-entry">
                  <div class="jobs-point"><span class="jobs-dot"></span><time>Jan 2025</time></div>
                  <a class="jobs-card" href="#role-${index}">Role ${index}</a>
                </li>
              `).join('')}
            </ol>
          </div>
        </div>
        <div class="jobs-rail-controls"><button type="button">Next card</button></div>
        </div></div>
      </section>
    `;
    document.body.appendChild(root);
    section = root.querySelector('.jobs-section')!;
    stage = root.querySelector('.jobs-stage')!;
    viewport = root.querySelector('.jobs-viewport')!;
    track = root.querySelector('.jobs-track')!;
    Object.defineProperty(viewport, 'clientWidth', { get: () => 800 });
    Object.defineProperty(track, 'scrollWidth', { get: () => trackWidth });
    Object.defineProperty(root.querySelector('.jobs-shell')!, 'offsetHeight', {
      configurable: true, get: () => shellHeight,
    });
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    root.remove();
    if (originalHeight) {
      Object.defineProperty(window, 'innerHeight', originalHeight);
    }
  });

  function travel(): gsap.core.Timeline {
    return gsap.getTweensOf(track)[0].parent!;
  }

  function entrance(): gsap.core.Timeline {
    return ScrollTrigger.getAll().find((trigger) => trigger.trigger === section && trigger.vars.once)!
      .animation as gsap.core.Timeline;
  }

  function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  function stubResizeObserver(): { observe: jasmine.Spy; disconnect: jasmine.Spy;
    dispatch(): Promise<void> } {
    let callback: ResizeObserverCallback | undefined;
    const observe = jasmine.createSpy('observe');
    const disconnect = jasmine.createSpy('disconnect');
    spyOn(window, 'ResizeObserver').and.callFake(function (next: ResizeObserverCallback) {
      callback = next;
      return { observe, disconnect } as unknown as ResizeObserver;
    });
    return {
      observe,
      disconnect,
      dispatch: async () => {
        callback?.([], {} as ResizeObserver);
        await nextFrame();
      },
    };
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
      intersect: (isIntersecting: boolean) => callback([{ isIntersecting } as IntersectionObserverEntry], observer),
    };
  }

  it('reveals the horizontal rail and entries without animating the header or advancing scroll progress', () => {
    root.style.paddingTop = 'calc(100vh + 50px)';
    motion = animateJobsTimeline(root);
    const intro = entrance();
    const trigger = intro.scrollTrigger!;
    const title = root.querySelector('.jobs-copy h2');
    const rail = root.querySelector('.jobs-rail');
    const fill = root.querySelector('.jobs-rail-fill');
    const entry = root.querySelector('.jobs-entry');
    const card = root.querySelector<HTMLElement>('.jobs-card')!;
    const [, entriesTween] = intro.getChildren(false, true, false);

    expect(trigger.vars.start).toBe('top 82%');
    expect(entriesTween.vars['stagger']).toBe(0.08);
    expect(gsap.getProperty(title, 'opacity')).toBe(1);
    expect(gsap.getProperty(rail, 'scaleX')).toBe(0);
    expect(gsap.getProperty(entry, 'opacity')).toBe(0);

    ScrollTrigger.refresh();
    const initialScroll = trigger.scroll();
    try {
      trigger.scroll(Math.ceil(trigger.start) + 1);
      ScrollTrigger.update();
      expect(intro.paused()).toBeFalse();
      intro.progress(1);
    } finally {
      trigger.scroll(initialScroll);
      ScrollTrigger.update();
    }

    expect(gsap.getProperty(title, 'opacity')).toBe(1);
    expect(gsap.getProperty(rail, 'scaleX')).toBe(1);
    expect(gsap.getProperty(entry, 'opacity')).toBe(1);
    expect(card.style.opacity).toBe('');
    expect(gsap.getProperty(track, 'x')).toBe(0);
    expect(gsap.getProperty(fill, 'scaleX')).toBe(0);
  });

  it('finishes the intro immediately if a keyboard user focuses the timeline', () => {
    root.style.paddingTop = 'calc(100vh + 50px)';
    motion = animateJobsTimeline(root);
    const intro = entrance();
    const cta = root.querySelector<HTMLElement>('.jobs-viewall')!;
    spyOn(cta, 'matches').withArgs(':focus-visible').and.returnValue(true);

    expect(intro.progress()).toBe(0);
    cta.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(intro.progress()).toBe(1);
    expect(gsap.getProperty(cta, 'opacity')).toBe(1);
  });

  it('pins the entire section and scrubs only the timeline contents in both directions', () => {
    motion = animateJobsTimeline(root);
    const timeline = travel();
    const trigger = timeline.scrollTrigger!;
    ScrollTrigger.refresh();

    expect(stage.classList.contains('jobs-pinned')).toBeTrue();
    expect(section.classList.contains('jobs-section-pinned')).toBeTrue();
    expect(trigger.pin).toBe(section);
    expect(trigger.vars.start).toBe('top top');
    expect(trigger.vars.scrub).toBeTrue();
    expect(trigger.end - trigger.start).toBeCloseTo(3442, 0);
    expect(timeline.getChildren()[0].vars['ease']).toBe('none');

    timeline.progress(1);
    expect(Number(gsap.getProperty(track, 'x'))).toBeCloseTo(-1600, 0);
    expect(Number(gsap.getProperty(root.querySelector('.jobs-rail-fill'), 'scaleX'))).toBe(1);
    expect(root.querySelectorAll('.jobs-entry')[3].classList.contains('jobs-entry-active')).toBeTrue();

    timeline.progress(0);
    expect(Number(gsap.getProperty(track, 'x'))).toBe(0);
    expect(Number(gsap.getProperty(root.querySelector('.jobs-rail-fill'), 'scaleX'))).toBe(0);
    expect(root.querySelectorAll('.jobs-entry')[0].classList.contains('jobs-entry-active')).toBeTrue();
  });

  it('leaves Experience in static flow if its animation arrives after the visitor has passed it', () => {
    const bounds = spyOn(root, 'getBoundingClientRect').and.returnValue(new DOMRect(0, -100, 100, 100));
    const { observer, intersect } = stubIntersectionObserver();
    motion = animateJobsTimeline(root);
    intersect(false);
    intersect(true); // A queued intersection must not mount the pin if the visitor has already moved on.

    expect(observer.observe).toHaveBeenCalledOnceWith(root);
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(root.classList).not.toContain('pin-spacer');
    expect(ScrollTrigger.getAll().some((trigger) => trigger.trigger === section)).toBeFalse();

    bounds.and.returnValue(new DOMRect(0, 0, 800, 500));
    intersect(true);

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(travel().scrollTrigger!.pin).toBe(section);
  });

  it('does not mount a delayed pin after teardown', () => {
    const bounds = spyOn(root, 'getBoundingClientRect').and.returnValue(new DOMRect(0, -100, 100, 100));
    const { observer, intersect } = stubIntersectionObserver();
    motion = animateJobsTimeline(root);
    motion.revert();
    motion = undefined;

    bounds.and.callThrough();
    intersect(true);

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(ScrollTrigger.getAll().some((trigger) => trigger.trigger === section)).toBeFalse();
  });

  for (const jobsFirst of [false, true]) {
    it(`includes both pins in downstream geometry when ${jobsFirst ? 'Jobs' : 'About'} mounts first`, () => {
      const about = document.createElement('div');
      about.innerHTML = `
        <section class="about-section">
          <div class="about-shell" style="height: 400px">
            <span class="about-fill"></span>
            <a class="about-index-link" href="#one">One</a>
            <a class="about-index-link" href="#two">Two</a>
            <div class="about-panels">
              <article class="about-panel" id="one"></article>
              <article class="about-panel" id="two"></article>
            </div>
          </div>
        </section>`;
      const downstream = document.createElement('div');
      downstream.style.height = '200vh';
      root.before(about);
      root.after(downstream);
      const reveal = ScrollTrigger.create({ trigger: downstream, start: 'top top' });
      const scroll = window.scrollY;
      const unpinnedStart = downstream.getBoundingClientRect().top + scroll;
      let aboutMotion: gsap.MatchMedia | undefined;
      try {
        if (jobsFirst) motion = animateJobsTimeline(root);
        aboutMotion = animateAboutMeScroll(about, false);
        if (!jobsFirst) motion = animateJobsTimeline(root);

        ScrollTrigger.refresh();

        const aboutPin = ScrollTrigger.getAll().find((trigger) => trigger.pin === about.querySelector('.about-shell'))!;
        const jobsPin = travel().scrollTrigger!;
        const spacing = (aboutPin.end - aboutPin.start) + (jobsPin.end - jobsPin.start);
        expect(reveal.start).toBeCloseTo(unpinnedStart + spacing, 0);
        expect(reveal.start).toBeCloseTo(downstream.getBoundingClientRect().top + window.scrollY, 0);
      } finally {
        reveal.kill();
        motion?.revert();
        motion = undefined;
        aboutMotion?.revert();
        about.remove();
        downstream.remove();
        window.scrollTo({ top: scroll, behavior: 'instant' });
      }
    });
  }

  it('holds the first role in place before beginning horizontal travel', () => {
    motion = animateJobsTimeline(root);
    const timeline = travel();
    const fill = root.querySelector('.jobs-rail-fill');
    timeline.progress(0.1);
    expect(Number(gsap.getProperty(track, 'x'))).toBe(0);
    expect(Number(gsap.getProperty(fill, 'scaleX'))).toBe(0);
    expect(root.querySelectorAll('.jobs-entry')[0].classList.contains('jobs-entry-active')).toBeTrue();

    timeline.progress(0.57);
    expect(Number(gsap.getProperty(track, 'x'))).toBeCloseTo(-800, 0);
    expect(Number(gsap.getProperty(fill, 'scaleX'))).toBeCloseTo(0.5, 2);

    timeline.progress(0.1);
    expect(Number(gsap.getProperty(track, 'x'))).toBe(0);
    expect(Number(gsap.getProperty(fill, 'scaleX'))).toBe(0);
  });

  it('lights markers only when the filled rail reaches them and reverses that state', () => {
    motion = animateJobsTimeline(root);
    const timeline = travel();
    const entries = root.querySelectorAll('.jobs-entry');

    // The second card can be emphasized before the line reaches its marker.
    timeline.progress(0.42);
    expect(entries[1].classList.contains('jobs-entry-active')).toBeTrue();
    expect(entries[0].classList.contains('jobs-entry-reached')).toBeTrue();
    expect(entries[1].classList.contains('jobs-entry-reached')).toBeFalse();

    timeline.progress(0.44);
    expect(entries[1].classList.contains('jobs-entry-reached')).toBeTrue();
    expect(entries[2].classList.contains('jobs-entry-reached')).toBeFalse();

    timeline.progress(1);
    expect(root.querySelectorAll('.jobs-entry-reached').length).toBe(4);

    timeline.progress(0.42);
    expect(entries[1].classList.contains('jobs-entry-reached')).toBeFalse();
    expect(root.querySelectorAll('.jobs-entry-reached').length).toBe(1);
  });

  it('recalculates travel when the rendered width changes', () => {
    motion = animateJobsTimeline(root);
    trackWidth = 2800;
    ScrollTrigger.refresh();
    travel().progress(1);
    expect(Number(gsap.getProperty(track, 'x'))).toBeCloseTo(-2000, 0);
    const trigger = travel().scrollTrigger!;
    expect(trigger.end - trigger.start).toBeCloseTo(4302, 0);
  });

  it('gives short timelines a minimum scroll range without adding horizontal travel', () => {
    trackWidth = 900;
    motion = animateJobsTimeline(root);
    ScrollTrigger.refresh();
    const timeline = travel();
    const trigger = timeline.scrollTrigger!;
    expect(trigger.end - trigger.start).toBeCloseTo(698, 0);
    timeline.progress(1);
    expect(Number(gsap.getProperty(track, 'x'))).toBeCloseTo(-100, 0);
  });

  it('includes viewport padding so the final role is not clipped', () => {
    viewport.style.paddingInline = '8px';
    motion = animateJobsTimeline(root);
    travel().progress(1);
    expect(Number(gsap.getProperty(track, 'x'))).toBeCloseTo(-1616, 0);
  });

  it('does not pin a horizontal timeline that fits in its viewport', () => {
    trackWidth = 700;
    motion = animateJobsTimeline(root);
    expect(stage.classList.contains('jobs-pinned')).toBeFalse();
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();
    expect(gsap.getTweensOf(root.querySelector('.jobs-entry'))[0].parent).toBe(entrance());
  });

  it('observes width and height in both pinned and fitting states', async () => {
    trackWidth = 700;
    const resize = stubResizeObserver();
    motion = animateJobsTimeline(root);

    expect(resize.observe.calls.allArgs()).toEqual([[viewport], [track], [root.querySelector('.jobs-shell')!]]);

    trackWidth = 2400;
    await resize.dispatch();
    expect(stage.classList.contains('jobs-pinned')).toBeTrue();
    expect(resize.disconnect).not.toHaveBeenCalled();
  });

  it('adds pinning and recovers focus when a fitting timeline starts overflowing', async () => {
    trackWidth = 700;
    const resize = stubResizeObserver();
    const focusTarget = root.querySelectorAll<HTMLElement>('.jobs-card')[3];
    const entry = focusTarget.closest<HTMLElement>('.jobs-entry')!;
    motion = animateJobsTimeline(root);
    focusTarget.focus({ preventScroll: true });
    spyOn(focusTarget, 'getBoundingClientRect')
      .and.returnValue(new DOMRect(1000, 0, 500, 200));
    spyOn(viewport, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 800, 300));
    Object.defineProperty(entry, 'offsetLeft', { value: 1500 });
    const scroll = spyOn(window, 'scrollTo');
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();

    trackWidth = 2400;
    await resize.dispatch();

    expect(stage.classList.contains('jobs-pinned')).toBeTrue();
    const pin = travel().scrollTrigger!;
    expect(pin.pin).toBe(section);
    expect(section.parentElement).toBe(root);
    expect(document.activeElement).toBe(focusTarget);
    const expectedProgress = 0.14 + (1380 / 1600) * 0.86;
    expect(scroll.calls.allArgs() as unknown[]).toContain([{
      top: pin.start + expectedProgress * (pin.end - pin.start),
      behavior: 'instant',
    }]);
    expect(Number(gsap.getProperty(track, 'x'))).toBeCloseTo(-1380, 0);
  });

  it('removes the stale pin and track travel when the content begins fitting', async () => {
    trackWidth = 2400;
    const resize = stubResizeObserver();
    motion = animateJobsTimeline(root);
    const focused = root.querySelector<HTMLElement>('.jobs-card')!;
    focused.focus({ preventScroll: true });
    spyOn(focused, 'scrollIntoView');
    expect(travel().scrollTrigger!.pin).toBe(section);
    expect(root.classList).toContain('pin-spacer');

    trackWidth = 700;
    await resize.dispatch();

    expect(stage.classList.contains('jobs-pinned')).toBeFalse();
    expect(section.classList.contains('jobs-section-pinned')).toBeFalse();
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();
    expect(root.classList).not.toContain('pin-spacer');
    expect(root.style.paddingBottom).toBe('');
    expect(document.activeElement).toBe(focused);
    expect(focused.scrollIntoView).toHaveBeenCalled();
    expect(Number(gsap.getProperty(track, 'x'))).toBe(0);
    expect(root.querySelector('.jobs-entry-active, .jobs-entry-reached')).toBeNull();
  });

  it('switches between native scrolling and pinning without rebuilding the entrance', async () => {
    shellHeight = 1001;
    const resize = stubResizeObserver();
    const report = jasmine.createSpy('reportPinned');
    motion = animateJobsTimeline(root, report);
    const intro = entrance();
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();

    shellHeight = 1000;
    await resize.dispatch();
    expect(stage.classList.contains('jobs-pinned')).toBeTrue();
    expect(entrance()).toBe(intro);

    shellHeight = 1001;
    await resize.dispatch();
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(stage.classList).not.toContain('jobs-pin-fit');
    expect(root.classList).not.toContain('pin-spacer');
    expect(report.calls.allArgs()).toEqual([[true], [false]]);
  });

  it('measures pin fit without the native arrows and waits for an arrow to lose focus before pinning', async () => {
    const controls = root.querySelector<HTMLElement>('.jobs-rail-controls')!;
    const button = controls.querySelector('button')!;
    const shell = root.querySelector<HTMLElement>('.jobs-shell')!;
    Object.defineProperty(shell, 'offsetHeight', {
      get: () => stage.classList.contains('jobs-pin-fit') ? 1000 : 1044,
    });
    button.focus({ preventScroll: true });
    motion = animateJobsTimeline(root);
    expect(document.activeElement).toBe(button);
    expect(stage.classList).not.toContain('jobs-pinned');

    button.blur();
    await nextFrame();

    expect(stage.classList).toContain('jobs-pinned');
    expect(stage.classList).not.toContain('jobs-pin-fit');
  });

  it('reevaluates pin eligibility on viewport height changes without an observer notification', async () => {
    stubResizeObserver();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 999 });
    motion = animateJobsTimeline(root);
    expect(stage.classList).not.toContain('jobs-pinned');

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1001 });
    window.dispatchEvent(new Event('resize'));
    await nextFrame();
    expect(stage.classList).toContain('jobs-pinned');

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 999 });
    window.dispatchEvent(new Event('resize'));
    await nextFrame();
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(root.classList).not.toContain('pin-spacer');
  });

  it('keeps horizontal entries unpinned on intermediate screens', () => {
    wide = false;
    motion = animateJobsTimeline(root);
    expect(stage.classList.contains('jobs-pinned')).toBeFalse();
    expect(entrance().getChildren().some(tween => tween.vars['stagger'] === 0.08)).toBeTrue();
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();
  });

  it('leaves the mobile timeline to native scrolling without a pin, reveal or track transform', () => {
    wide = false;
    mobile = true;
    motion = animateJobsTimeline(root);
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(ScrollTrigger.getAll().some((trigger) => root.contains(trigger.trigger!))).toBeFalse();
    expect(gsap.getTweensOf(root.querySelectorAll('.jobs-rail, .jobs-card, .jobs-track')).length)
      .toBe(0);
  });

  it('draws the vertical rail down and reveals the point with its card for a single role', () => {
    root.querySelectorAll('.jobs-entry:not(:first-child)').forEach(entry => entry.remove());
    motion = animateJobsTimeline(root);
    const intro = entrance();
    const rail = root.querySelector('.jobs-rail');
    const entry = root.querySelector('.jobs-entry')!;
    const parts = Array.from(entry.querySelectorAll('.jobs-point, .jobs-card'));
    const [reveal] = gsap.getTweensOf(parts);

    expect(gsap.getProperty(rail, 'scaleX')).toBe(1);
    expect(gsap.getProperty(rail, 'scaleY')).toBe(0);
    expect(reveal.targets()).toEqual(parts);
    expect(reveal.scrollTrigger!.trigger).toBe(entry);
    expect(reveal.scrollTrigger!.vars.once).toBeTrue();

    intro.progress(1);
    expect(gsap.getProperty(rail, 'scaleY')).toBe(1);
  });

  it('does not add travel transforms or pin the section when the content is too tall', () => {
    shellHeight = window.innerHeight + 1;
    motion = animateJobsTimeline(root);
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(gsap.getTweensOf(track)).toHaveSize(0);
  });

  it('leaves all content static and unpinned for reduced motion', () => {
    canAnimate = false;
    motion = animateJobsTimeline(root);
    expect(stage.classList).not.toContain('jobs-pinned');
    const revealTargets = root.querySelectorAll(
      '.jobs-copy > *, .jobs-viewall, .jobs-rail, .jobs-entry, .jobs-point, .jobs-card',
    );
    expect(gsap.getTweensOf(revealTargets).length).toBe(0);
    expect(ScrollTrigger.getAll().some((trigger) => root.contains(trigger.trigger!))).toBeFalse();
  });

  it('does not pin a single role', () => {
    root.querySelectorAll('.jobs-entry').forEach((entry, index) => {
      if (index > 0) {
        entry.remove();
      }
    });
    motion = animateJobsTimeline(root);
    expect(stage.classList).not.toContain('jobs-pinned');
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();
  });

  it('brings an off-screen keyboard-focused role into view immediately', () => {
    motion = animateJobsTimeline(root);
    const entry = root.querySelectorAll<HTMLElement>('.jobs-entry')[3];
    ScrollTrigger.refresh();
    Object.defineProperty(entry, 'offsetLeft', { value: 1800 });
    spyOn(entry.querySelector('a')!, 'getBoundingClientRect')
      .and.returnValue(new DOMRect(1800, 0, 500, 200));
    spyOn(viewport, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 800, 300));
    const scroll = spyOn(window, 'scrollTo');
    entry.querySelector('a')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(scroll).toHaveBeenCalled();
    expect(scroll.calls.allArgs() as unknown[])
      .toContain([jasmine.objectContaining({ behavior: 'instant' })]);
    expect(Number(gsap.getProperty(track, 'x'))).toBeCloseTo(-1600, 0);
  });

  it('cleans up its own pin, transforms, and interaction listeners only', () => {
    const elsewhere = document.createElement('div');
    document.body.appendChild(elsewhere);
    const unrelated = ScrollTrigger.create({ trigger: elsewhere });
    motion = animateJobsTimeline(root);
    entrance().progress(0.5);
    travel().progress(0.5);
    motion.revert();
    motion = undefined;

    expect(stage.classList).not.toContain('jobs-pin-fit');
    expect(stage.classList.contains('jobs-pinned')).toBeFalse();
    expect(section.classList.contains('jobs-section-pinned')).toBeFalse();
    expect(root.classList).not.toContain('pin-spacer');
    expect(section.parentElement).toBe(root);
    expect(track.style.transform).toBe('');
    expect(root.querySelector('.jobs-entry-active')).toBeNull();
    expect(root.querySelector('.jobs-entry-reached')).toBeNull();
    for (const target of root.querySelectorAll<HTMLElement>(
      '.jobs-copy > *, .jobs-viewall, .jobs-rail, .jobs-entry',
    )) {
      expect(target.style.opacity).toBe('');
      expect(target.style.transform).toBe('');
    }
    expect(ScrollTrigger.getAll()).toContain(unrelated);
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();

    const scroll = spyOn(window, 'scrollTo');
    root.querySelector('a')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(scroll).not.toHaveBeenCalled();
    unrelated.kill();
    elsewhere.remove();
  });
});
