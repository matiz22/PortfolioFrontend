import { gsap } from 'gsap';
import { animateHomeText } from './home-text-motion';
import { HomeCopyRegistry } from '../../shared/animations/home-copy-registry';

describe('homepage text motion', () => {
  let root: HTMLElement;
  let registry: HomeCopyRegistry;
  let unregisterProjects: () => void;
  let motion: gsap.MatchMedia | undefined;
  let reducedMotion: boolean;
  let observe: jasmine.Spy;
  let unobserve: jasmine.Spy;
  let disconnect: jasmine.Spy;
  let onIntersection: IntersectionObserverCallback;

  beforeEach(() => {
    reducedMotion = false;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', { value: !reducedMotion });
      return media;
    });
    observe = jasmine.createSpy('observe');
    unobserve = jasmine.createSpy('unobserve');
    disconnect = jasmine.createSpy('disconnect');
    spyOn(window, 'IntersectionObserver').and.callFake(function (callback) {
      onIntersection = callback;
      return { observe, unobserve, disconnect } as unknown as IntersectionObserver;
    });
    root = document.createElement('main');
    root.innerHTML = `
      <section id="text-motion-projects" data-grain-chapter tabindex="-1">
        <header class="projects-home-header">
          <h2>Projects</h2><p class="projects-home-description">Personal builds.</p>
          <a href="#projects">View all projects</a>
        </header>
      </section>
      <section class="contact-section">
        <div class="contact-copy">
          <h2 style="line-height: 30px">Zbudujmy<br>coś razem.</h2><p>Get in touch.</p>
        </div>
        <input aria-label="Name">
      </section>
    `;
    document.body.appendChild(root);
    registry = new HomeCopyRegistry();
    unregisterProjects = registry.register(element('.projects-home-header'), {
      heading: 'h2', details: '.projects-home-description', effect: 'wipe', duration: 0.32,
    });
    registry.register(element('.contact-copy'), {
      heading: 'h2', details: 'p', effect: 'lines', duration: 0.52, stagger: 0.16,
      focusScope: '.contact-section', keepAtPageEnd: true,
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

  function intersect(target: Element, intersectionRatio: number, top = 100): void {
    onIntersection([{
      target, isIntersecting: intersectionRatio > 0, intersectionRatio,
      boundingClientRect: { top }, rootBounds: { top: 0 },
    } as IntersectionObserverEntry], {} as IntersectionObserver);
  }

  function animation(target: HTMLElement): gsap.core.Timeline {
    return gsap.getTweensOf(target).find((tween) => tween.duration() > 0)!.parent!;
  }

  it('wipes in on entry, reverses faster on exit, and replays in either direction', () => {
    motion = animateHomeText(root, registry);
    const title = element('.projects-home-header h2');
    expect(observe).toHaveBeenCalledWith(title);
    expect(title.style.opacity).toBe('');

    intersect(title, 0);
    expect(title.style.opacity).toBe('0');
    intersect(title, 0.5);
    const entrance = animation(title);
    expect(entrance.reversed()).toBeFalse();
    entrance.pause(0.08);
    expect(title.style.clipPath).not.toBe('');
    entrance.progress(1);
    expect(title.style.clipPath).toBe('');
    expect(title.style.opacity).toBe('');

    intersect(title, 0.35, -100);
    expect(title.style.opacity).toBe('');
    intersect(title, 0.18, -100);
    const exit = animation(title);
    expect(exit.reversed()).toBeTrue();
    expect(Math.abs(exit.timeScale())).toBeGreaterThan(1);
    exit.pause().progress(0);
    expect(title.style.opacity).toBe('0');

    intersect(title, 0.5, -20);
    expect(animation(title)).not.toBe(entrance);
    animation(title).progress(1);
    intersect(title, 0.03, 800);
    expect(animation(title).reversed()).toBeTrue();
  });

  it('changes direction mid-transition without creating a second tween stack', () => {
    motion = animateHomeText(root, registry);
    const title = element('.projects-home-header h2');
    intersect(title, 0);
    intersect(title, 0.6);
    const reveal = animation(title);
    reveal.pause(0.12);

    intersect(title, 0.04);
    expect(animation(title)).toBe(reveal);
    expect(reveal.reversed()).toBeTrue();
    intersect(title, 0.6);
    expect(animation(title)).toBe(reveal);
    expect(reveal.reversed()).toBeFalse();
  });

  it('does not hide already-visible content on hydration or links when focus enters', () => {
    motion = animateHomeText(root, registry);
    const title = element('.projects-home-header h2');
    const link = element('a');
    intersect(title, 0.8);
    expect(gsap.getTweensOf(title)).toEqual([]);
    intersect(title, 0);
    animation(title).pause().progress(0);
    expect(title.style.opacity).toBe('0');
    expect(link.getAttribute('style')).toBeNull();

    link.focus();
    expect(title.style.opacity).toBe('');
    expect(link.getAttribute('style')).toBeNull();
  });

  it('waits for a fragment destination to enter view and reveals it despite native anchor focus', () => {
    const originalUrl = location.href;
    try {
      history.replaceState(null, '', '#text-motion-projects');
      motion = animateHomeText(root, registry);
      const title = element('.projects-home-header h2');
      intersect(title, 0);
      expect(title.style.opacity).toBe('0');
      expect(gsap.getTweensOf(title).some((tween) => tween.duration() > 0)).toBeFalse();
      element('#text-motion-projects').focus();
      intersect(title, 0.8);
      const entrance = animation(title);
      expect(entrance.reversed()).toBeFalse();
      entrance.progress(1);
      expect(title.style.opacity).toBe('');
    } finally {
      history.replaceState(null, '', originalUrl);
    }
  });

  it('animates a directly linked heading on the first visible observation', () => {
    const originalUrl = location.href;
    try {
      const title = element('.projects-home-header h2');
      title.id = 'text-motion-projects-heading';
      title.tabIndex = -1;
      history.replaceState(null, '', '#text-motion-projects-heading');
      motion = animateHomeText(root, registry);
      title.focus();
      intersect(title, 0.8);
      expect(animation(title).reversed()).toBeFalse();
    } finally {
      history.replaceState(null, '', originalUrl);
    }
  });

  it('replays an already visible destination on hash navigation without restarting an active entrance', () => {
    const originalUrl = location.href;
    try {
      motion = animateHomeText(root, registry);
      const title = element('.projects-home-header h2');
      intersect(title, 0.8);
      expect(gsap.getTweensOf(title)).toEqual([]);

      history.replaceState(null, '', '#text-motion-projects');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      const entrance = animation(title);
      entrance.pause(0.1);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      expect(animation(title)).toBe(entrance);
      expect(entrance.time()).toBeCloseTo(0.1, 2);
    } finally {
      history.replaceState(null, '', originalUrl);
    }
  });

  it('reveals a deferred destination that mounts after the hash changes', async () => {
    const originalUrl = location.href;
    const chapter = element('#text-motion-projects');
    const intro = element('.projects-home-header');
    const title = element('.projects-home-header h2');
    unregisterProjects();
    intro.remove();
    try {
      motion = animateHomeText(root, registry);
      history.replaceState(null, '', '#text-motion-projects');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      chapter.appendChild(intro);
      registry.register(intro, { heading: 'h2', effect: 'wipe', duration: 0.32 });
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(observe).toHaveBeenCalledWith(title);
      intersect(title, 0.8);
      expect(animation(title).reversed()).toBeFalse();
    } finally {
      history.replaceState(null, '', originalUrl);
    }
  });

  it('reveals native contact lines in two beats without touching the form or replacing nodes', () => {
    spyOnProperty(document.scrollingElement!, 'scrollHeight').and.returnValue(window.scrollY + window.innerHeight);
    motion = animateHomeText(root, registry);
    const title = element('.contact-copy h2');
    const lineBreak = title.querySelector('br');
    intersect(title, 0);
    intersect(title, 0.5);
    const entrance = animation(title);
    expect(entrance.getTweensOf(title).length).toBe(2);
    entrance.progress(1);
    expect(title.querySelector('br')).toBe(lineBreak);
    expect(title.style.clipPath).toBe('');
    expect(element('input').getAttribute('style')).toBeNull();

    intersect(title, 0.08, -100);
    expect(title.style.opacity).toBe('');
    intersect(title, 0.5);
    intersect(title, 0.08, 800);
    expect(animation(title).reversed()).toBeTrue();
  });

  it('keeps the first contact line revealed when the second beat starts', () => {
    element('.contact-copy').style.height = '240px';
    motion = animateHomeText(root, registry);
    const title = element('.contact-copy h2');
    intersect(title, 0);
    intersect(title, 0.5);
    const entrance = animation(title);
    const secondBeat = entrance.getTweensOf(title)[1];
    const bottomInset = () => {
      const value = getComputedStyle(title).clipPath.match(/-?[\d.]+(?:px|%)/g)![2];
      return parseFloat(value) * (value.endsWith('%') ? title.offsetHeight / 100 : 1);
    };

    entrance.pause(secondBeat.startTime() - 0.01);
    const betweenBeats = bottomInset();
    expect(betweenBeats).toBeCloseTo(title.offsetHeight / 2, 1);
    entrance.time(secondBeat.startTime() + 0.001);
    expect(bottomInset()).toBeLessThanOrEqual(betweenBeats);
    expect(bottomInset()).toBeGreaterThan(betweenBeats - 1);
    expect(title.style.opacity).toBe('1');
  });

  it('picks up deferred card text and releases removed nodes and inline styles', async () => {
    motion = animateHomeText(root, registry);
    const card = document.createElement('article');
    card.className = 'education-card';
    card.innerHTML = `
      <div class="education-main">
        <h3 class="education-degree">Computer science</h3>
        <p class="education-institution">University</p>
      </div>
    `;
    root.appendChild(card);
    const unregister = registry.register(card.querySelector<HTMLElement>('.education-main')!, {
      heading: '.education-degree', details: '.education-institution', duration: 0.35, focusScope: '.education-card',
    });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const title = element('.education-degree');
    expect(observe).toHaveBeenCalledWith(title);
    intersect(title, 0);
    expect(title.style.opacity).toBe('0');
    unregister();
    card.remove();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(unobserve).toHaveBeenCalledWith(title);
    expect(title.style.opacity).toBe('');
    motion.revert();
    expect(disconnect).toHaveBeenCalled();
  });

  it('resumes retained registrations without duplicated observers after route reattachment', () => {
    motion = animateHomeText(root, registry);
    const title = element('.projects-home-header h2');
    intersect(title, 0);
    expect(title.style.opacity).toBe('0');
    motion.revert();
    expect(title.style.opacity).toBe('');
    observe.calls.reset();
    motion = animateHomeText(root, registry);
    expect(observe.calls.allArgs().filter(([node]) => node === title).length).toBe(1);
    unregisterProjects();
    expect(unobserve).toHaveBeenCalledWith(title);
  });

  it('does not observe or modify text when reduced motion is on', () => {
    reducedMotion = true;
    const original = root.innerHTML;
    motion = animateHomeText(root, registry);
    expect(observe).not.toHaveBeenCalled();
    expect(root.innerHTML).toBe(original);
  });
});
