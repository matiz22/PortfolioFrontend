import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateEducationCards } from './education-animation';

describe('education card animation', () => {
  let root: HTMLElement;
  let revert: (() => void) | undefined;
  let reducedMotion: boolean;
  let hoverCapable: boolean;
  let desktop: boolean;

  function wrapper(index: number): HTMLElement {
    return root.querySelectorAll<HTMLElement>('.education-motion')[index]!;
  }

  function surface(index: number): HTMLElement {
    return wrapper(index).firstElementChild as HTMLElement;
  }

  function finishTweens(target: HTMLElement): void {
    gsap.getTweensOf(target).forEach((tween) => tween.progress(1));
  }

  beforeEach(() => {
    reducedMotion = false;
    hoverCapable = true;
    desktop = true;
    root = document.createElement('div');
    root.innerHTML = `
      <div class="education-motion"><article class="education-card"><a href="#one">One</a></article></div>
      <div class="education-motion"><article class="education-card"><a href="#two">Two</a></article></div>
    `;
    document.body.appendChild(root);

    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: query.includes('no-preference') ? desktop && !reducedMotion
          : query.includes('hover') ? hoverCapable
          : query.includes('prefers-reduced-motion') ? reducedMotion
          : media.matches,
      });
      return media;
    });
  });

  afterEach(() => {
    revert?.();
    revert = undefined;
    root.remove();
  });

  it('hides cards before travel and removes inline styles once revealed', () => {
    root.style.marginTop = '200vh';
    revert = animateEducationCards(root);
    expect(wrapper(0).style.opacity).toBe('0');
    expect(wrapper(0).style.willChange).toBe('');
    expect(Number(gsap.getProperty(wrapper(0), 'y'))).toBe(48);
    expect(Number(gsap.getProperty(wrapper(1), 'y'))).toBe(48);

    const trigger = ScrollTrigger.getAll().find((candidate) => candidate.trigger === wrapper(0))!;
    trigger.vars.onEnter?.(trigger);
    expect(wrapper(0).style.willChange).toBe('transform, opacity');
    finishTweens(wrapper(0));
    expect(wrapper(0).style.opacity).toBe('');
    expect(wrapper(0).style.transform).toBe('');
    expect(wrapper(0).style.willChange).toBe('');
    expect(wrapper(1).style.opacity).toBe('0');
  });

  it('fades a revealed card back out when scrolled above the window', () => {
    revert = animateEducationCards(root);
    const trigger = ScrollTrigger.getAll().find((candidate) => candidate.trigger === wrapper(0))!;
    trigger.vars.onEnter?.(trigger);
    finishTweens(wrapper(0));
    expect(wrapper(0).style.opacity).toBe('');

    trigger.vars.onLeaveBack?.(trigger);
    expect(wrapper(0).style.willChange).toBe('transform, opacity');
    finishTweens(wrapper(0));
    expect(wrapper(0).style.opacity).toBe('0');
    expect(Number(gsap.getProperty(wrapper(0), 'y'))).toBe(48);
    expect(wrapper(0).style.willChange).toBe('');
  });

  it('tilts only the hovered card surface toward the cursor on precise pointers', () => {
    revert = animateEducationCards(root);
    expect(surface(0).style.transform).toBe('');
    expect(surface(0).style.willChange).toBe('');
    surface(0).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    expect(surface(0).style.willChange).toBe('transform');
    finishTweens(surface(0));
    expect(Number(gsap.getProperty(surface(0), 'rotationX'))).not.toBe(0);
    expect(Number(gsap.getProperty(surface(0), 'rotationY'))).not.toBe(0);
    expect(Number(gsap.getProperty(surface(1), 'rotationY'))).toBe(0);
    expect(surface(1).style.willChange).toBe('');

    surface(0).dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    expect(surface(0).style.willChange).toBe('transform');
    finishTweens(surface(0));
    expect(Number(gsap.getProperty(surface(0), 'rotationY'))).toBe(0);
    expect(Number(gsap.getProperty(surface(0), 'x'))).toBe(0);
    expect(surface(0).style.transform).toBe('');
    expect(surface(0).style.willChange).toBe('');
  });

  it('does not retain cleanup tweens after repeated hovers', () => {
    const motion = gsap.matchMedia();
    spyOn(gsap, 'matchMedia').and.returnValue(motion);
    revert = animateEducationCards(root);
    const [context] = motion.contexts;
    const initialTweenCount = context['getTweens']().length;
    const card = surface(0);

    for (let i = 0; i < 3; i++) {
      card.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
      finishTweens(card);
      card.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
      finishTweens(card);
    }

    expect(context['getTweens']().length).toBe(initialTweenCount);
  });

  it('measures the card at pointer entry after its initial offscreen layout changes', () => {
    const bounds = spyOn(surface(0), 'getBoundingClientRect')
      .and.returnValue(new DOMRect(0, 500, 200, 100));
    revert = animateEducationCards(root);
    bounds.and.returnValue(new DOMRect(100, 100, 200, 100));

    surface(0).dispatchEvent(new PointerEvent('pointerenter', {
      pointerType: 'mouse', clientX: 200, clientY: 150,
    }));
    finishTweens(surface(0));
    expect(Number(gsap.getProperty(surface(0), 'rotationX'))).toBeCloseTo(0);
    expect(Number(gsap.getProperty(surface(0), 'rotationY'))).toBeCloseTo(0);
  });

  it('invalidates hovered card bounds after scrolling', () => {
    const bounds = spyOn(surface(0), 'getBoundingClientRect')
      .and.returnValue(new DOMRect(0, 0, 200, 100));
    revert = animateEducationCards(root);
    surface(0).dispatchEvent(new PointerEvent('pointerenter', {
      pointerType: 'mouse', clientX: 100, clientY: 50,
    }));
    bounds.and.returnValue(new DOMRect(100, 100, 200, 100));
    window.dispatchEvent(new Event('scroll'));
    surface(0).dispatchEvent(new PointerEvent('pointermove', {
      pointerType: 'mouse', clientX: 200, clientY: 150,
    }));
    finishTweens(surface(0));

    expect(Number(gsap.getProperty(surface(0), 'rotationX'))).toBeCloseTo(0);
    expect(Number(gsap.getProperty(surface(0), 'rotationY'))).toBeCloseTo(0);
  });

  it('immediately reveals a keyboard-focused card and refuses to fade it out', () => {
    revert = animateEducationCards(root);
    const trigger = ScrollTrigger.getAll().find((candidate) => candidate.trigger === wrapper(0))!;
    trigger.vars.onEnter?.(trigger);
    root.querySelector<HTMLAnchorElement>('a')!.focus();
    expect(wrapper(0).style.opacity).toBe('');
    expect(wrapper(0).style.transform).toBe('');
    expect(wrapper(0).style.willChange).toBe('');

    trigger.vars.onLeaveBack?.(trigger);
    finishTweens(wrapper(0));
    expect(wrapper(0).style.opacity).toBe('');
    expect(wrapper(0).style.transform).toBe('');
  });

  it('keeps an already-focused card visible when motion mounts', () => {
    root.querySelector<HTMLAnchorElement>('a')!.focus();
    revert = animateEducationCards(root);
    expect(wrapper(0).style.opacity).toBe('');
    expect(wrapper(0).style.transform).toBe('');
  });

  it('keeps reduced-motion and touch-only layouts static', () => {
    reducedMotion = true;
    hoverCapable = false;
    revert = animateEducationCards(root);
    expect(wrapper(0).style.opacity).toBe('');
    expect(Number(gsap.getProperty(wrapper(0), 'y'))).toBe(0);
    expect(Number(gsap.getProperty(surface(0), 'y'))).toBe(0);
  });

  it('leaves mobile rail cards visible even on a hover-capable device', () => {
    desktop = false;
    revert = animateEducationCards(root);
    expect(wrapper(0).style.opacity).toBe('');
    expect(wrapper(0).style.transform).toBe('');
    expect(ScrollTrigger.getAll().some((trigger) => root.contains(trigger.trigger!))).toBeFalse();
  });

  it('clears scroll listeners, tilt handlers, and inline styles on disposal', () => {
    revert = animateEducationCards(root);
    const cancelFrame = spyOn(window, 'cancelAnimationFrame').and.callThrough();
    const link = root.querySelector<HTMLAnchorElement>('a')!;
    surface(0).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    window.dispatchEvent(new Event('scroll'));
    revert();
    revert = undefined;

    expect(cancelFrame).toHaveBeenCalled();
    expect(wrapper(0).style.opacity).toBe('');
    expect(wrapper(0).style.transform).toBe('');
    expect(Number(gsap.getProperty(surface(0), 'rotationY'))).toBe(0);
    expect(surface(0).style.willChange).toBe('');
    expect(gsap.getTweensOf(surface(0))).toEqual([]);
    surface(0).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    expect(Number(gsap.getProperty(surface(0), 'rotationY'))).toBe(0);
    link.blur();
  });

  it('does not restart tilt tweens when reduced motion is enabled mid-tilt', () => {
    revert = animateEducationCards(root);
    surface(0).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    expect(gsap.getTweensOf(surface(0)).length).toBeGreaterThan(0);

    reducedMotion = true;
    gsap.matchMediaRefresh();

    expect(surface(0).style.transform).toBe('');
    expect(surface(0).style.willChange).toBe('');
    expect(gsap.getTweensOf(surface(0))).toEqual([]);
  });
});
