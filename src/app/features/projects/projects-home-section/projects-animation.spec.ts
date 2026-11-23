import { gsap } from 'gsap';
import { animateProjects } from './projects-animation';

describe('projects animation', () => {
  let root: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let reducedMotion: boolean;
  let hoverCapable: boolean;
  let desktop: boolean;
  let wideScreen: boolean;
  let observe: jasmine.Spy;
  let unobserve: jasmine.Spy;
  let disconnect: jasmine.Spy;
  let delayedCall: jasmine.Spy;
  let onIntersection: IntersectionObserverCallback;

  beforeEach(() => {
    reducedMotion = false;
    hoverCapable = true;
    desktop = true;
    wideScreen = false;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: query === '(min-width: 64rem)' ? wideScreen : desktop && !reducedMotion && (
          !query.includes('(hover: hover)') || hoverCapable
        ),
      });
      return media;
    });

    observe = jasmine.createSpy('observe');
    unobserve = jasmine.createSpy('unobserve');
    disconnect = jasmine.createSpy('disconnect');
    spyOn(window, 'IntersectionObserver').and.callFake(function (callback) {
      onIntersection = callback;
      return { observe, unobserve, disconnect } as unknown as IntersectionObserver;
    });
    delayedCall = spyOn(gsap, 'delayedCall').and.callThrough();

    root = document.createElement('section');
    root.innerHTML = `
      <h2 class="projects-home-reveal">Projects</h2>
      <div class="projects-home-grid">
        <div class="projects-home-row">
        <div class="projects-home-slot">
          <div class="projects-home-motion">
            <article class="project-preview">
               <h3><a href="#project" class="project-preview-title-link">Developer Toolkit</a></h3>
              <div class="project-preview-art"></div>
              <div class="project-preview-shade"></div>
              <div class="project-preview-drawer">
                <div class="project-preview-brief">
                  <p class="project-preview-description">Tools for developers.</p>
                  <div class="project-preview-actions"><a href="#demo">Live demo</a></div>
                </div>
              </div>
            </article>
          </div>
        </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    for (const target of root.querySelectorAll<HTMLElement>(
      '.projects-home-reveal, .projects-home-slot',
    )) {
      spyOn(target, 'getBoundingClientRect').and.returnValue({
        top: 100, bottom: 500, left: 0, right: 500, width: 500, height: 400,
      } as DOMRect);
    }
    Object.defineProperty(root.querySelector('.project-preview-brief'), 'offsetHeight', {
      value: 184,
    });
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    root.remove();
  });

  function element(selector: string): HTMLElement {
    return root.querySelector<HTMLElement>(selector)!;
  }

  function intersect(target: Element, ratio = 0.25, top = 100): void {
    onIntersection([{
      target, isIntersecting: ratio > 0, intersectionRatio: ratio,
      boundingClientRect: { top },
    } as IntersectionObserverEntry], {} as IntersectionObserver);
  }

  function animation(selector: string): gsap.core.Timeline {
    return gsap.getTweensOf(element(selector))
      .find((tween) => tween.duration() > 0)!.parent!;
  }

  function enter(pointerType = 'mouse'): void {
    element('.project-preview').dispatchEvent(new PointerEvent('pointerenter', { pointerType }));
  }

  function leave(): void {
    element('.project-preview').dispatchEvent(new PointerEvent('pointerleave'));
  }

  function finishIntent(): void {
    delayedCall.calls.mostRecent().returnValue.progress(1);
  }

  it('observes stationary slots while wobbling a separate visual layer', () => {
    motion = animateProjects(root);
    const slot = element('.projects-home-slot');
    const surface = element('.projects-home-motion');
    expect(observe).toHaveBeenCalledWith(slot);
    expect(surface.style.opacity).toBe('0');
    expect(surface.style.visibility).not.toBe('hidden');

    intersect(slot);
    const entrance = animation('.projects-home-motion');
    expect(entrance.duration()).toBeCloseTo(0.74, 2);
    expect(entrance.scrollTrigger).toBeUndefined();
    entrance.pause(0.35);
    expect(Number(gsap.getProperty(surface, 'rotation'))).not.toBe(0);
    expect(slot.style.transform).toBe('');
    entrance.progress(1);
    expect(surface.style.opacity).toBe('');
    expect(surface.style.transform).toBe('');
  });

  it('uses distinct entry/exit thresholds and replays the entrance after exiting', () => {
    motion = animateProjects(root);
    const slot = element('.projects-home-slot');
    intersect(slot);
    animation('.projects-home-motion').progress(1);

    intersect(slot, 0.12);
    expect(element('.projects-home-motion').style.opacity).toBe('');
    intersect(slot, 0.04, -380);
    const exit = animation('.projects-home-motion');
    expect(exit.duration()).toBe(0.3);
    exit.progress(1);
    expect(element('.projects-home-motion').style.opacity).toBe('0');
    expect(Number(gsap.getProperty(element('.projects-home-motion'), 'y'))).toBe(-18);

    intersect(slot, 0.12);
    expect(element('.projects-home-motion').style.opacity).toBe('0');
    intersect(slot);
    expect(animation('.projects-home-motion').duration()).toBeCloseTo(0.74, 2);
  });

  it('leaves heading motion to the home page text controller', () => {
    motion = animateProjects(root);
    const heading = element('.projects-home-reveal');
    expect(observe).not.toHaveBeenCalledWith(heading);
    expect(gsap.getTweensOf(heading)).toEqual([]);
    expect(heading.style.transform).toBe('');
  });

  it('waits for hover intent, then animates the drawer actual height', () => {
    motion = animateProjects(root);
    const drawer = element('.project-preview-drawer');
    expect(element('.project-preview').classList).toContain('project-preview-interactive');
    expect(drawer.style.height).toBe('0px');
    expect(drawer.inert).toBeTrue();
    enter();
    expect(element('.project-preview').hasAttribute('data-project-expanded')).toBeFalse();
    finishIntent();

    const expansion = animation('.project-preview-drawer');
    expansion.pause(0.26);
    expect(parseFloat(drawer.style.height)).toBeGreaterThan(0);
    expect(parseFloat(drawer.style.height)).toBeLessThan(184);
    expansion.progress(1);
    expect(drawer.style.height).toBe('auto');
    expect(drawer.inert).toBeFalse();
    expect(element('.project-preview').getAttribute('data-project-expanded')).toBe('true');
  });

  it('retargets a partially open drawer on leave and collapses it after a grace period', () => {
    motion = animateProjects(root);
    enter();
    finishIntent();
    const expansion = animation('.project-preview-drawer');
    expansion.pause(0.2);
    leave();
    expect(element('.project-preview').getAttribute('data-project-expanded')).toBe('true');
    finishIntent();
    expect(expansion.parent).toBeNull();

    animation('.project-preview-drawer').progress(1);
    expect(element('.project-preview-drawer').style.height).toBe('0px');
    expect(element('.project-preview-drawer').inert).toBeTrue();
  });

  it('keeps the drawer open when the pointer returns during its grace period', () => {
    motion = animateProjects(root);
    enter();
    finishIntent();
    animation('.project-preview-drawer').progress(1);
    leave();
    const collapseIntent = delayedCall.calls.mostRecent().returnValue;
    enter();
    expect(collapseIntent.parent).toBeNull();
    finishIntent();
    expect(element('.project-preview').getAttribute('data-project-expanded')).toBe('true');
  });

  it('immediately exposes actions for keyboard focus and pins the visible card', () => {
    motion = animateProjects(root);
    element('.project-preview-title-link').focus();
    const drawer = element('.project-preview-drawer');
    expect(element('.projects-home-motion').style.opacity).toBe('');
    expect(drawer.style.height).toBe('auto');
    expect(drawer.inert).toBeFalse();
    expect(drawer.getAttribute('aria-hidden')).toBe('false');

    leave();
    intersect(element('.projects-home-slot'), 0);
    expect(element('.projects-home-motion').style.opacity).toBe('');
    expect(drawer.inert).toBeFalse();
  });

  it('preserves focus that was inside a card before initialization', () => {
    element('.project-preview-title-link').focus();
    motion = animateProjects(root);
    expect(element('.project-preview-drawer').style.height).toBe('auto');
    expect(element('.projects-home-motion').style.opacity).toBe('');
  });

  it('ignores touch hover but opens immediately without swallowing a hybrid-device tap', () => {
    motion = animateProjects(root);
    enter('touch');
    expect(element('.project-preview-drawer').inert).toBeTrue();
    const tap = new PointerEvent('pointerdown', { pointerType: 'touch', cancelable: true });
    element('.project-preview').dispatchEvent(tap);
    expect(element('.project-preview-drawer').style.height).toBe('auto');
    expect(tap.defaultPrevented).toBeFalse();
    leave();
    expect(element('.project-preview-drawer').inert).toBeFalse();
  });

  it('leaves details naturally expanded on devices without desktop hover', () => {
    hoverCapable = false;
    motion = animateProjects(root);
    expect(element('.project-preview-drawer').style.height).toBe('');
    expect(element('.project-preview-drawer').inert).toBeFalse();
    expect(element('.project-preview-drawer').hasAttribute('aria-hidden')).toBeFalse();
  });

  it('does not hide cards or collapse details on the mobile rail', () => {
    desktop = false;
    const original = root.innerHTML;
    motion = animateProjects(root);
    expect(root.innerHTML).toBe(original);
    expect(observe).not.toHaveBeenCalled();
  });

  it('selects the horizontal interaction on wide screens', () => {
    wideScreen = true;
    motion = animateProjects(root);
    expect(element('.projects-home-row').classList).toContain('projects-home-row-horizontal');
    expect(element('.project-preview').classList).toContain('project-preview-horizontal');
    expect(element('.project-preview-drawer').style.width).toBe('0px');
    expect(element('.project-preview-drawer').style.height).toBe('');
  });

  it('does not enable horizontal expansion for wide touch devices', () => {
    wideScreen = true;
    hoverCapable = false;
    motion = animateProjects(root);
    expect(element('.project-preview').classList).not.toContain('project-preview-horizontal');
    expect(element('.project-preview-drawer').inert).toBeFalse();
    expect(element('.project-preview-drawer').style.width).toBe('');
  });

  it('leaves the DOM untouched for reduced motion', () => {
    reducedMotion = true;
    wideScreen = true;
    const original = root.innerHTML;
    motion = animateProjects(root);
    enter();
    expect(root.innerHTML).toBe(original);
    expect(observe).not.toHaveBeenCalled();
  });

  it('restores styles, attributes and listeners and cancels pending work on teardown', () => {
    motion = animateProjects(root);
    enter();
    finishIntent();
    const expansion = animation('.project-preview-drawer');
    expansion.pause(0.2);
    leave();
    const collapseIntent = delayedCall.calls.mostRecent().returnValue;
    motion.revert();
    enter();
    intersect(element('.projects-home-slot'));

    expect(disconnect).toHaveBeenCalled();
    expect(expansion.parent).toBeNull();
    expect(collapseIntent.parent).toBeNull();
    expect(element('.projects-home-motion').style.transform).toBe('');
    expect(element('.projects-home-motion').style.opacity).toBe('');
    expect(element('.project-preview-drawer').style.height).toBe('');
    expect(element('.project-preview').classList).not.toContain('project-preview-interactive');
    expect(element('.project-preview-drawer').inert).toBeFalse();
    expect(element('.project-preview-drawer').hasAttribute('aria-hidden')).toBeFalse();
    expect(element('.project-preview').hasAttribute('data-project-expanded')).toBeFalse();
  });
});
