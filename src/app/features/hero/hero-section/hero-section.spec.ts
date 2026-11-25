import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HomeMotionLifecycle } from '../../../shared/animations/home-motion-lifecycle';
import { MOTION_ALLOWED_QUERY } from '../../../shared/animations/motion-media';
import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  it('renders its priority portrait before any deferred blocks are triggered', async () => {
    TestBed.configureTestingModule({ imports: [HeroSection], deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(HeroSection);
    await fixture.whenStable();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.hero-portrait img');
    expect(image).not.toBeNull();
    expect(image.getAttribute('src')).toBe('hero.png');
    expect(image.getAttribute('fetchpriority')).toBe('high');
    expect(image.getAttribute('loading')).toBe('eager');
    expect(image.getAttribute('alt')).toBe('');
    expect(fixture.nativeElement.querySelector('.hero-name')?.textContent).toContain('Mateusz Malich');
    expect(fixture.nativeElement.querySelector('.hero-photo.skeleton')).toBeNull();
  });

  describe('optional animation lifecycle', () => {
    let fixture: ComponentFixture<HeroSection>;
    let root: HTMLElement;
    let section: HTMLElement;
    let motionPreference: MediaQueryList;
    let allowsMotion: boolean;
    let fontsReady: jasmine.Spy;
    let finishFonts: (fonts: FontFaceSet) => void;
    let observeResize: jasmine.Spy;
    let disconnectResize: jasmine.Spy;
    let disconnectIntro: jasmine.Spy;

    const triggers = () => ScrollTrigger.getAll().filter(trigger => trigger.trigger === section);

    function setMotionAllowed(allowed: boolean): void {
      allowsMotion = allowed;
      motionPreference.dispatchEvent(new Event('change'));
    }

    async function finishLoading(): Promise<void> {
      // Wait for the same module imports the real component uses, then unblock setup.
      await Promise.all([import('./hero-scroll-animation'), import('./hero-text-animation')]);
      finishFonts(document.fonts);
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }

    beforeEach(async () => {
      allowsMotion = false;
      motionPreference = new EventTarget() as MediaQueryList;
      Object.defineProperty(motionPreference, 'matches', { get: () => allowsMotion });
      const matchMedia = window.matchMedia.bind(window);
      spyOn(window, 'matchMedia').and.callFake(query => {
        if (query === MOTION_ALLOWED_QUERY) {
          return motionPreference;
        }
        const media = matchMedia(query);
        // The lifecycle under test is independent of which pointer the runner has.
        if (query.includes(MOTION_ALLOWED_QUERY)) {
          Object.defineProperty(media, 'matches', { value: false });
        }
        return media;
      });
      fontsReady = spyOnProperty(document.fonts, 'ready').and.returnValue(
        new Promise<FontFaceSet>(resolve => { finishFonts = resolve; }),
      );
      observeResize = jasmine.createSpy('observeResize');
      disconnectResize = jasmine.createSpy('disconnectResize');
      disconnectIntro = jasmine.createSpy('disconnectIntro');
      spyOn(window, 'ResizeObserver').and.callFake(function () {
        let observesHeroSection = false;
        return {
          observe(target) {
            if (target === section) {
              observesHeroSection = true;
              observeResize(target);
            }
          },
          disconnect() {
            if (observesHeroSection) {
              disconnectResize();
            }
          },
          unobserve: () => undefined,
        };
      });
      spyOn(window, 'IntersectionObserver').and.callFake(function () {
        return { observe: () => undefined, disconnect: disconnectIntro } as unknown as IntersectionObserver;
      });

      TestBed.configureTestingModule({ imports: [HeroSection], providers: [HomeMotionLifecycle] });
      fixture = TestBed.createComponent(HeroSection);
      await fixture.whenStable();
      root = fixture.nativeElement;
      section = root.querySelector('.hero-section')!;
    });

    it('waits for motion eligibility and fonts, then reverts both animations when motion is disabled', async () => {
      const heading = root.querySelector('.hero-headline-main')!;
      const original = heading.innerHTML;
      expect(fontsReady).not.toHaveBeenCalled();
      expect(triggers()).toHaveSize(0);

      setMotionAllowed(true);
      expect(fontsReady).toHaveBeenCalledTimes(2);
      expect(observeResize).not.toHaveBeenCalled();
      expect(heading.innerHTML).toBe(original);
      await finishLoading();

      expect(triggers()).toHaveSize(3);
      expect(observeResize).toHaveBeenCalledWith(section);
      expect(heading.querySelector('.hero-build-word')).not.toBeNull();

      setMotionAllowed(false);
      expect(triggers()).toHaveSize(0);
      expect(disconnectResize).toHaveBeenCalledTimes(1);
      expect(disconnectIntro).toHaveBeenCalledTimes(1);
      expect(heading.innerHTML).toBe(original);
    });

    it('does not mount late work while detached, remounts once, and cleans up on destroy', async () => {
      const lifecycle = TestBed.inject(HomeMotionLifecycle);
      setMotionAllowed(true);
      lifecycle.detach();
      await finishLoading();
      expect(triggers()).toHaveSize(0);
      expect(observeResize).not.toHaveBeenCalled();

      lifecycle.attach();
      expect(triggers()).toHaveSize(3);
      lifecycle.detach();
      expect(triggers()).toHaveSize(0);
      expect(disconnectResize).toHaveBeenCalledTimes(1);
      expect(disconnectIntro).toHaveBeenCalledTimes(1);

      lifecycle.attach();
      expect(triggers()).toHaveSize(3);
      expect(fontsReady).toHaveBeenCalledTimes(2);

      fixture.destroy();
      expect(triggers()).toHaveSize(0);
      expect(disconnectResize).toHaveBeenCalledTimes(2);
      expect(disconnectIntro).toHaveBeenCalledTimes(2);

      lifecycle.detach();
      lifecycle.attach();
      setMotionAllowed(false);
      setMotionAllowed(true);
      expect(triggers()).toHaveSize(0);
    });
  });
});
