import { gsap } from 'gsap';
import { FINE_POINTER_MOTION_QUERY, MOTION_ALLOWED_QUERY } from '../../../shared/animations/motion-media';

import { animateHeroText } from './hero-text-animation';

describe('hero text animation', () => {
  let root: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let reducedMotion: boolean;
  let hoverCapable: boolean;

  beforeEach(() => {
    reducedMotion = false;
    hoverCapable = true;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: !reducedMotion && (
          query === MOTION_ALLOWED_QUERY ||
          (hoverCapable && query === FINE_POINTER_MOTION_QUERY)
        ),
      });
      return media;
    });

    root = document.createElement('section');
    root.innerHTML = `
      <h1>
        <span class="hero-headline-main">Thoughtful software.</span>
        <span class="hero-headline-accent">Smarter workflows.</span>
      </h1>
      <p class="hero-role-caption">Software Engineer · AI &amp; Automation</p>
      <p class="hero-description">Practical software for complex requirements.</p>
      <div class="hero-actions"><a href="#work">Explore my work</a></div>
    `;
    document.body.appendChild(root);
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    root.remove();
  });

  function timeline(): gsap.core.Timeline {
    return gsap.getTweensOf(root.querySelector('.hero-description'))[0].parent!;
  }

  function enterAccent(pointerType = 'mouse'): void {
    root.querySelector('.hero-headline-accent')!.dispatchEvent(
      new PointerEvent('pointerenter', { pointerType }),
    );
  }

  function enterMain(pointerType = 'mouse'): void {
    root.querySelector('.hero-headline-main')!.dispatchEvent(
      new PointerEvent('pointerenter', { pointerType }),
    );
  }

  function hoverTimeline(selector: '.hero-ripple-char' | '.hero-glide-word'): gsap.core.Timeline {
    let animation: gsap.core.Animation =
      gsap.getTweensOf(root.querySelector(selector))[0];
    while (animation.parent && animation.parent !== gsap.globalTimeline) {
      animation = animation.parent;
    }
    return animation as gsap.core.Timeline;
  }

  for (const [mainText, accentText] of [
    ['I build what’s missing.', 'I connect what works.'],
    ['Tworzę to, czego brakuje.', 'Łączę to, co działa.'],
  ] as const) {
    it(`reveals and restores the rendered copy: ${mainText}`, () => {
      const main = root.querySelector<HTMLElement>('.hero-headline-main')!;
      const accent = root.querySelector<HTMLElement>('.hero-headline-accent')!;
      main.textContent = mainText;
      accent.textContent = accentText;

      motion = animateHeroText(root);

      expect(main.querySelectorAll('.hero-build-word-mask').length).toBe(mainText.split(' ').length);
      expect(accent.querySelectorAll('.hero-flow-char').length).toBeGreaterThan(0);
      expect(main.getAttribute('aria-label')).toBe(mainText);
      expect(accent.getAttribute('aria-label')).toBe(accentText);
      expect(main.textContent).toBe(mainText);
      expect(accent.textContent).toBe(accentText);
      expect(timeline().repeat()).toBe(0);
      expect(timeline().duration()).toBeCloseTo(1.18, 2);
      expect(gsap.getTweensOf(root.querySelector('.hero-actions')).length).toBe(0);

      timeline().progress(1);

      expect(main.innerHTML).toBe(mainText);
      expect(accent.innerHTML).toBe(accentText);
      expect(main.hasAttribute('aria-label')).toBeFalse();
      expect(accent.hasAttribute('aria-label')).toBeFalse();
      for (const element of root.querySelectorAll<HTMLElement>(
        '.hero-role-caption, .hero-description, .hero-actions',
      )) {
        expect(element.style.transform).toBe('');
        expect(element.style.opacity).toBe('');
        expect(element.style.visibility).toBe('');
      }
    });

    for (const [effect, wordSelector] of [
      ['intro', '.hero-build-word-mask'],
      ['hover', '.hero-glide-word'],
    ] as const) {
      it(`keeps the same line breaks through narrow ${effect} motion: ${mainText}`, () => {
        const main = root.querySelector<HTMLElement>('.hero-headline-main')!;
        main.textContent = mainText;
        main.style.cssText = `
          display: block; width: 300px; font: 40px/.96 Arial, sans-serif;
          letter-spacing: -.035em; text-align: center; text-wrap: balance;
        `;
        // Simulate a browser that balances plain text but not the inline-block word wrappers.
        const style = document.createElement('style');
        style.textContent = `.hero-headline-main:has(${wordSelector}) { text-wrap: wrap !important; }`;
        root.append(style);

        motion = animateHeroText(root);
        let animation = timeline();
        if (effect === 'hover') {
          animation.progress(1);
          enterMain();
          animation = hoverTimeline('.hero-glide-word');
        }
        animation.pause(effect === 'hover' ? 0.2 : 0);
        const [first, second, third, fourth] = Array.from(
          main.querySelectorAll(wordSelector), (word) => word.getBoundingClientRect().top,
        );

        expect(first).toBe(second);
        expect(third).toBeGreaterThan(second);
        expect(third).toBe(fourth);

        animation.progress(1);
        expect(main.innerHTML).toBe(mainText);
      });
    }
  }

  it('leaves the original DOM untouched when reduced motion is preferred', () => {
    reducedMotion = true;
    const original = root.innerHTML;

    motion = animateHeroText(root);
    enterMain();
    enterAccent();

    expect(root.innerHTML).toBe(original);
    expect(gsap.getTweensOf(root.querySelector('.hero-description')).length).toBe(0);
  });

  it('restores text and inline styles when reverted during the reveal', () => {
    const originalText = root.textContent;
    motion = animateHeroText(root);
    const animation = timeline();
    animation.pause(0.5);

    motion.revert();

    expect(root.querySelector('.hero-build-word')).toBeNull();
    expect(root.querySelector('.hero-flow-char')).toBeNull();
    expect(root.textContent).toBe(originalText);
    expect(root.querySelector<HTMLElement>('.hero-actions')!.style.visibility).toBe('');
    expect(animation.parent).toBeNull();
  });

  it('does not animate matching selectors outside the hero', () => {
    const otherDescription = document.createElement('p');
    otherDescription.className = 'hero-description';
    document.body.appendChild(otherDescription);

    try {
      motion = animateHeroText(root);

      expect(otherDescription.hasAttribute('style')).toBeFalse();
      expect(gsap.getTweensOf(otherDescription).length).toBe(0);
    } finally {
      otherDescription.remove();
    }
  });

  function observeHero() {
    root.innerHTML = `<section class="hero-section">${root.innerHTML}</section>`;
    const section = root.querySelector('.hero-section')!;
    spyOn(section, 'getBoundingClientRect').and.returnValue({ bottom: 600 } as DOMRect);
    const disconnect = jasmine.createSpy('disconnect');
    let onIntersection!: IntersectionObserverCallback;
    spyOn(window, 'IntersectionObserver').and.callFake(function (callback) {
      onIntersection = callback;
      return { observe: () => {}, disconnect } as unknown as IntersectionObserver;
    });
    const intersect = (intersectionRatio: number) => onIntersection(
      [{
        target: section, intersectionRatio, boundingClientRect: { height: window.innerHeight },
      } as IntersectionObserverEntry], {} as IntersectionObserver,
    );
    return { intersect, disconnect };
  }

  it('replays when scrolling away and coming back into the hero', () => {
    const { intersect, disconnect } = observeHero();
    motion = animateHeroText(root);
    const originalIntro = timeline();
    originalIntro.progress(1);
    intersect(0.6);
    expect(root.querySelector('.hero-build-word')).toBeNull();

    enterAccent();
    intersect(0.05);
    expect(root.querySelector('.hero-ripple-char')).toBeNull();
    intersect(0.25);
    expect(root.querySelector('.hero-build-word')).toBeNull();
    intersect(0.6);
    expect(timeline()).not.toBe(originalIntro);
    expect(root.querySelector('.hero-build-word')).not.toBeNull();
    timeline().progress(1);
    expect(root.querySelector('.hero-build-word')).toBeNull();

    motion.revert();
    expect(disconnect).toHaveBeenCalled();
  });

  it('replays when navigating to #home even if the hero is already in view', () => {
    const { intersect } = observeHero();
    const originalUrl = location.href;
    try {
      motion = animateHeroText(root);
      const intro = timeline();
      intro.progress(1);
      intersect(0.6);
      history.replaceState(null, '', '#home');
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      expect(timeline()).not.toBe(intro);
      expect(root.querySelector('.hero-build-word')).not.toBeNull();
    } finally {
      history.replaceState(null, '', originalUrl);
    }
  });

  it('plays one left-to-right hover wave and restores the accent afterward', () => {
    motion = animateHeroText(root);
    timeline().progress(1);
    const accent = root.querySelector<HTMLElement>('.hero-headline-accent')!;
    const original = accent.innerHTML;

    enterAccent();

    const chars = accent.querySelectorAll('.hero-ripple-char');
    const animation = hoverTimeline('.hero-ripple-char');
    expect(chars.length).toBeGreaterThan(0);
    expect(accent.getAttribute('aria-label')).toBe('Smarter workflows.');
    expect(animation.repeat()).toBe(0);
    expect(animation.duration()).toBeCloseTo(0.6, 2);
    animation.pause(0.13);
    expect(Number(gsap.getProperty(chars[0], 'y'))).toBeCloseTo(-3, 2);
    expect(Number(gsap.getProperty(chars[chars.length - 1], 'y'))).toBe(0);

    animation.progress(1);

    expect(accent.innerHTML).toBe(original);
    expect(accent.hasAttribute('aria-label')).toBeFalse();
    expect(root.querySelector('.hero-ripple-char')).toBeNull();
  });

  it('does not interrupt the entrance with hover motion', () => {
    motion = animateHeroText(root);
    timeline().pause(0.5);

    enterAccent();
    enterMain();

    expect(root.querySelector('.hero-ripple-char')).toBeNull();
    expect(root.querySelector('.hero-glide-word')).toBeNull();
    expect(root.querySelector('.hero-flow-char')).not.toBeNull();
  });

  it('ignores re-entry during a wave and allows another wave after it finishes', () => {
    motion = animateHeroText(root);
    timeline().progress(1);
    enterAccent();
    const firstChar = root.querySelector('.hero-ripple-char');
    const animation = hoverTimeline('.hero-ripple-char');
    animation.pause(0.25);

    enterAccent();

    expect(root.querySelector('.hero-ripple-char')).toBe(firstChar);
    expect(animation.time()).toBeCloseTo(0.25, 2);

    animation.progress(1);
    enterAccent();

    expect(root.querySelector('.hero-ripple-char')).not.toBeNull();
    expect(root.querySelector('.hero-ripple-char')).not.toBe(firstChar);
    expect(hoverTimeline('.hero-ripple-char')).toBe(animation);
  });

  it('does not play hover motion for touch input on a hybrid device', () => {
    motion = animateHeroText(root);
    timeline().progress(1);

    enterAccent('touch');
    enterMain('touch');

    expect(root.querySelector('.hero-ripple-char')).toBeNull();
    expect(root.querySelector('.hero-glide-word')).toBeNull();
  });

  it('does not attach hover motion for coarse pointers', () => {
    hoverCapable = false;
    motion = animateHeroText(root);
    timeline().progress(1);

    enterAccent();
    enterMain();

    expect(root.querySelector('.hero-ripple-char')).toBeNull();
    expect(root.querySelector('.hero-glide-word')).toBeNull();
  });

  it('cleans up both active hover effects and their listeners when motion is reverted', () => {
    motion = animateHeroText(root);
    timeline().progress(1);
    enterAccent();
    enterMain();
    const ripple = hoverTimeline('.hero-ripple-char');
    const glide = hoverTimeline('.hero-glide-word');
    ripple.pause(0.2);
    glide.pause(0.2);

    motion.revert();
    enterAccent();
    enterMain();

    expect(root.querySelector('.hero-ripple-char')).toBeNull();
    expect(root.querySelector('.hero-glide-word')).toBeNull();
    expect(root.querySelector('.hero-headline-accent')!.innerHTML).toBe('Smarter workflows.');
    expect(root.querySelector('.hero-headline-main')!.innerHTML).toBe('Thoughtful software.');
    expect(ripple.parent).toBeNull();
    expect(glide.parent).toBeNull();
  });

  for (const mainText of ['Thoughtful software.', 'Przemyślane aplikacje.']) {
    it(`glides whole words in sequence and restores the rendered copy: ${mainText}`, () => {
      const main = root.querySelector<HTMLElement>('.hero-headline-main')!;
      main.textContent = mainText;
      motion = animateHeroText(root);
      timeline().progress(1);

      enterMain();

      const words = main.querySelectorAll('.hero-glide-word');
      const animation = hoverTimeline('.hero-glide-word');
      expect(words.length).toBe(2);
      expect(main.getAttribute('aria-label')).toBe(mainText);
      expect(main.textContent).toBe(mainText);
      expect(animation.repeat()).toBe(0);
      expect(animation.duration()).toBeCloseTo(0.5, 2);
      animation.pause(0.07);
      expect(Number(gsap.getProperty(words[0], 'x'))).toBeGreaterThan(0);
      expect(Number(gsap.getProperty(words[1], 'x'))).toBe(0);
      animation.pause(0.15);
      expect(Number(gsap.getProperty(words[0], 'x'))).toBeCloseTo(4, 2);
      expect(Number(gsap.getProperty(words[0], 'y'))).toBe(0);
      expect(root.querySelector('.hero-headline-accent')!.innerHTML).toBe('Smarter workflows.');

      animation.progress(1);

      expect(main.innerHTML).toBe(mainText);
      expect(main.hasAttribute('aria-label')).toBeFalse();
      expect(root.querySelector('.hero-glide-word')).toBeNull();
    });
  }

  it('lets a glide finish before accepting another entry and reuses its timeline', () => {
    motion = animateHeroText(root);
    timeline().progress(1);
    enterMain();
    const firstWord = root.querySelector('.hero-glide-word');
    const animation = hoverTimeline('.hero-glide-word');
    animation.pause(0.2);

    enterMain();

    expect(root.querySelector('.hero-glide-word')).toBe(firstWord);
    expect(animation.time()).toBeCloseTo(0.2, 2);

    animation.progress(1);
    enterMain();

    expect(root.querySelector('.hero-glide-word')).not.toBeNull();
    expect(root.querySelector('.hero-glide-word')).not.toBe(firstWord);
    expect(hoverTimeline('.hero-glide-word')).toBe(animation);
  });
});
