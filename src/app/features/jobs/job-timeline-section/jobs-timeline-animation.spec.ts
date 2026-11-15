import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateJobsTimeline } from './jobs-timeline-animation';

describe('jobs timeline animation', () => {
  let root: HTMLElement;
  let section: HTMLElement;
  let stage: HTMLElement;
  let viewport: HTMLElement;
  let track: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let wide: boolean;
  let canAnimate: boolean;
  let trackWidth: number;
  let stageHeight: number;
  let originalHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    wide = true;
    canAnimate = true;
    trackWidth = 2400;
    stageHeight = 300;
    // Karma's test iframe may have zero height; use a deterministic desktop viewport.
    originalHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: query.includes('min-width') ? wide : canAnimate,
      });
      return media;
    });

    root = document.createElement('div');
    root.innerHTML = `
      <section class="jobs-section">
      <div class="jobs-stage">
        <div class="jobs-viewport">
          <div class="jobs-track">
            <div class="jobs-rail"><span class="jobs-rail-fill"></span></div>
            <ol class="jobs-list">
              ${[0, 1, 2, 3].map((index) => `
                <li class="jobs-entry">
                  <a class="jobs-card" href="#role-${index}">Role ${index}</a>
                </li>
              `).join('')}
            </ol>
          </div>
        </div>
      </div>
      </section>
    `;
    document.body.appendChild(root);
    section = root.querySelector('.jobs-section')!;
    stage = root.querySelector('.jobs-stage')!;
    viewport = root.querySelector('.jobs-viewport')!;
    track = root.querySelector('.jobs-track')!;
    Object.defineProperty(viewport, 'clientWidth', { get: () => 800 });
    Object.defineProperty(track, 'scrollWidth', { get: () => trackWidth });
    Object.defineProperty(stage, 'offsetHeight', { get: () => stageHeight });
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

  it('pins the entire section and scrubs only the timeline contents in both directions', () => {
    motion = animateJobsTimeline(root);
    const timeline = travel();
    const trigger = timeline.scrollTrigger!;
    ScrollTrigger.refresh();

    expect(stage.classList.contains('jobs-horizontal')).toBeTrue();
    expect(stage.classList.contains('jobs-scrollable')).toBeTrue();
    expect(stage.classList.contains('jobs-pinned')).toBeTrue();
    expect(section.classList.contains('jobs-section-pinned')).toBeTrue();
    expect(stage.style.getPropertyValue('--jobs-nav-clearance')).toBe('80px');
    expect(trigger.pin).toBe(section);
    expect(trigger.vars.start).toBe('top top');
    expect(trigger.vars.scrub).toBeTrue();
    expect(trigger.end - trigger.start).toBeCloseTo(4800, 0);
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

  it('holds the first role in place before beginning horizontal travel', () => {
    motion = animateJobsTimeline(root);
    const timeline = travel();
    const fill = root.querySelector('.jobs-rail-fill');
    timeline.progress(0.1);
    expect(Number(gsap.getProperty(track, 'x'))).toBe(0);
    expect(Number(gsap.getProperty(fill, 'scaleX'))).toBe(0);
    expect(root.querySelectorAll('.jobs-entry')[0].classList.contains('jobs-entry-active')).toBeTrue();

    timeline.progress(0.6);
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
    timeline.progress(0.46);
    expect(entries[1].classList.contains('jobs-entry-active')).toBeTrue();
    expect(entries[0].classList.contains('jobs-entry-reached')).toBeTrue();
    expect(entries[1].classList.contains('jobs-entry-reached')).toBeFalse();

    timeline.progress(0.48);
    expect(entries[1].classList.contains('jobs-entry-reached')).toBeTrue();
    expect(entries[2].classList.contains('jobs-entry-reached')).toBeFalse();

    timeline.progress(1);
    expect(root.querySelectorAll('.jobs-entry-reached').length).toBe(4);

    timeline.progress(0.46);
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
    expect(trigger.end - trigger.start).toBeCloseTo(6000, 0);
  });

  it('gives short timelines a minimum scroll range without adding horizontal travel', () => {
    trackWidth = 900;
    motion = animateJobsTimeline(root);
    ScrollTrigger.refresh();
    const timeline = travel();
    const trigger = timeline.scrollTrigger!;
    expect(trigger.end - trigger.start).toBeCloseTo(937.5, 1);
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
    expect(stage.classList.contains('jobs-horizontal')).toBeTrue();
    expect(stage.classList.contains('jobs-scrollable')).toBeFalse();
    expect(stage.classList.contains('jobs-pinned')).toBeFalse();
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();
  });

  it('uses a vertical unpinned list on compact screens', () => {
    wide = false;
    motion = animateJobsTimeline(root);
    expect(stage.classList.contains('jobs-horizontal')).toBeFalse();
    expect(stage.classList.contains('jobs-pinned')).toBeFalse();
    expect(stage.style.getPropertyValue('--jobs-nav-clearance')).toBe('');
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();
  });

  it('falls back to vertical if the content would exceed the available height', () => {
    stageHeight = window.innerHeight;
    motion = animateJobsTimeline(root);
    expect(stage.classList.contains('jobs-horizontal')).toBeFalse();
    expect(stage.classList.contains('jobs-scrollable')).toBeFalse();
  });

  it('leaves all content static and unpinned for reduced motion', () => {
    canAnimate = false;
    motion = animateJobsTimeline(root);
    expect(stage.classList.contains('jobs-horizontal')).toBeFalse();
    expect(gsap.getTweensOf(root.querySelectorAll('.jobs-card')).length).toBe(0);
    expect(ScrollTrigger.getAll().some((trigger) => root.contains(trigger.trigger!))).toBeFalse();
  });

  it('does not pin a single role', () => {
    root.querySelectorAll('.jobs-entry').forEach((entry, index) => {
      if (index > 0) {
        entry.remove();
      }
    });
    motion = animateJobsTimeline(root);
    expect(stage.classList.contains('jobs-horizontal')).toBeFalse();
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
    travel().progress(0.5);
    motion.revert();
    motion = undefined;

    expect(stage.classList.contains('jobs-horizontal')).toBeFalse();
    expect(stage.classList.contains('jobs-pinned')).toBeFalse();
    expect(section.classList.contains('jobs-section-pinned')).toBeFalse();
    expect(stage.style.getPropertyValue('--jobs-nav-clearance')).toBe('');
    expect(root.querySelector('.pin-spacer')).toBeNull();
    expect(track.style.transform).toBe('');
    expect(root.querySelector('.jobs-entry-active')).toBeNull();
    expect(root.querySelector('.jobs-entry-reached')).toBeNull();
    expect(ScrollTrigger.getAll()).toContain(unrelated);
    expect(ScrollTrigger.getAll().some((trigger) => trigger.pin === section)).toBeFalse();

    const scroll = spyOn(window, 'scrollTo');
    root.querySelector('a')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(scroll).not.toHaveBeenCalled();
    unrelated.kill();
    elsewhere.remove();
  });
});
