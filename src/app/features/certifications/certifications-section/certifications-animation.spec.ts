import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateCertifications } from './certifications-animation';

describe('certifications wall animation', () => {
  let root: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let reducedMotion: boolean;
  let desktop: boolean;
  let batch: jasmine.Spy;
  let kill: jasmine.Spy;

  beforeEach(() => {
    reducedMotion = false;
    desktop = true;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', {
        value: desktop && !reducedMotion,
      });
      return media;
    });
    kill = jasmine.createSpy('kill');
    batch = spyOn(ScrollTrigger, 'batch').and.returnValue([
      { kill } as unknown as ScrollTrigger,
    ]);
    root = document.createElement('section');
    root.innerHTML = `
      <div class="certifications-wall">
        <div class="certifications-slot">
          <div class="certifications-motion"><a href="#certificate-one">Certificate one</a></div>
        </div>
        <div class="certifications-slot">
          <div class="certifications-motion"><a href="#certificate-two">Certificate two</a></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    spyOn(root.querySelector('.certifications-wall')!, 'getBoundingClientRect').and.returnValue({
      left: 0, width: 900,
    } as DOMRect);
    root.querySelectorAll('.certifications-slot').forEach((slot, index) => {
      spyOn(slot, 'getBoundingClientRect').and.returnValue({
        left: index * 600, width: 300, bottom: 500,
      } as DOMRect);
    });
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    root.remove();
  });

  function surface(): HTMLElement {
    return root.querySelector<HTMLElement>('.certifications-motion')!;
  }

  function trigger(event: 'onEnter' | 'onEnterBack' | 'onLeave' | 'onLeaveBack' = 'onEnter'): void {
    const vars = batch.calls.mostRecent().args[1];
    vars[event](Array.from(root.querySelectorAll('.certifications-slot')), []);
  }

  function finishTween(): gsap.core.Tween {
    const tween = gsap.getTweensOf(surface()).find((candidate) => candidate.duration() > 0)!;
    expect(tween).toBeDefined();
    tween.progress(1);
    return tween;
  }

  it('spreads separate visual layers from the centre and keeps repeatable triggers', () => {
    motion = animateCertifications(root);
    expect(surface().style.opacity).toBe('0');
    expect(surface().style.visibility).not.toBe('hidden');
    expect(Number(gsap.getProperty(surface(), 'x'))).toBeGreaterThan(0);
    expect(Number(gsap.getProperty(surface(), 'x'))).toBeLessThanOrEqual(36);
    expect(Number(gsap.getProperty(surface(), 'scale'))).toBe(1);
    expect(Number(gsap.getProperty(surface(), 'rotation'))).toBe(0);
    expect(root.querySelector<HTMLElement>('.certifications-slot')!.style.transform).toBe('');
    expect(batch.calls.mostRecent().args[1].once).not.toBeTrue();
    expect(batch.calls.mostRecent().args[1].end).toBe('bottom top');
    trigger();
    const tween = finishTween();
    expect(tween.duration()).toBe(0.6);
    expect(surface().style.opacity).toBe('');
    expect(surface().style.transform).toBe('');
  });

  it('animates out and back in on every pass in either direction', () => {
    motion = animateCertifications(root);
    trigger();
    finishTween();

    for (let pass = 0; pass < 2; pass++) {
      trigger('onLeave');
      expect(finishTween().duration()).toBe(0.28);
      expect(surface().style.opacity).toBe('0');
      expect(Number(gsap.getProperty(surface(), 'y'))).toBeLessThan(0);

      trigger('onEnterBack');
      expect(finishTween().duration()).toBe(0.6);
      expect(surface().style.opacity).toBe('');
      expect(surface().style.transform).toBe('');

      trigger('onLeaveBack');
      finishTween();
      expect(surface().style.opacity).toBe('0');
      expect(Number(gsap.getProperty(surface(), 'y'))).toBeGreaterThan(0);

      trigger('onEnter');
      finishTween();
      expect(surface().style.opacity).toBe('');
      expect(surface().style.transform).toBe('');
    }
  });

  it('includes certificates above the viewport so they can re-enter from below', () => {
    (root.querySelector('.certifications-slot')!.getBoundingClientRect as jasmine.Spy)
      .and.returnValue({ left: 0, width: 300, bottom: -100 } as DOMRect);
    motion = animateCertifications(root);
    expect(batch.calls.mostRecent().args[0].length).toBe(2);
    expect(Number(gsap.getProperty(surface(), 'y'))).toBeLessThan(0);
    trigger('onEnterBack');
    finishTween();
    expect(surface().style.opacity).toBe('');
  });

  it('replaces an unfinished entrance when scrolling out quickly', () => {
    motion = animateCertifications(root);
    trigger();
    const entrance = gsap.getTweensOf(surface()).find((tween) => tween.duration() > 0)!;
    entrance.progress(0.25);
    trigger('onLeave');
    expect(entrance.parent).toBeNull();
    finishTween();
    expect(surface().style.opacity).toBe('0');
  });

  it('does not hide or animate content for reduced motion', () => {
    reducedMotion = true;
    motion = animateCertifications(root);
    expect(batch).not.toHaveBeenCalled();
    expect(surface().style.opacity).toBe('');
    expect(surface().style.transform).toBe('');
  });

  it('leaves cards visible and unanimated on the mobile rail', () => {
    desktop = false;
    motion = animateCertifications(root);
    expect(batch).not.toHaveBeenCalled();
    expect(surface().style.opacity).toBe('');
    expect(surface().style.transform).toBe('');
  });

  it('immediately exposes focused links, even during their entrance', () => {
    motion = animateCertifications(root);
    trigger();
    const entrance = gsap.getTweensOf(surface()).find((tween) => tween.duration() > 0)!;
    root.querySelector<HTMLAnchorElement>('a')!.focus();
    expect(surface().style.opacity).toBe('');
    expect(surface().style.transform).toBe('');
    expect(entrance.parent).toBeNull();
    expect(gsap.getTweensOf(surface()).some((tween) => tween.duration() > 0)).toBeFalse();
  });

  it('does not animate a focused certificate out of view', () => {
    motion = animateCertifications(root);
    root.querySelector<HTMLAnchorElement>('a')!.focus();
    trigger('onLeave');
    trigger('onLeaveBack');
    expect(surface().style.opacity).toBe('');
    expect(surface().style.transform).toBe('');
    expect(gsap.getTweensOf(surface()).some((tween) => tween.duration() > 0)).toBeFalse();
  });

  it('does not hide a certificate that already has focus', () => {
    root.querySelector<HTMLAnchorElement>('a')!.focus();
    motion = animateCertifications(root);
    expect(surface().style.opacity).toBe('');
    expect(surface().style.transform).toBe('');
  });

  it('cleans up only its own triggers, styles, and focus listener', () => {
    motion = animateCertifications(root);
    motion.revert();
    expect(kill).toHaveBeenCalled();
    expect(surface().style.opacity).toBe('');
    expect(surface().style.transform).toBe('');
    surface().style.opacity = '0.5';
    root.querySelector<HTMLAnchorElement>('a')!.focus();
    expect(surface().style.opacity).toBe('0.5');
  });
});
