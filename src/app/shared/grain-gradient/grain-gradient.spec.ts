import {TestBed} from '@angular/core/testing';
import {GrainGradient} from './grain-gradient';
import {GRAIN_CHAPTER_PALETTES} from './grain-gradient-palette';

describe('GrainGradient with a fixed chapter', () => {
  it('renders the chapter colors as CSS without starting the scroll palette watcher', async () => {
    const observe = spyOn(IntersectionObserver.prototype, 'observe');
    const listen = spyOn(window, 'addEventListener').and.callThrough();
    const fixture = TestBed.createComponent(GrainGradient);
    fixture.componentRef.setInput('chapter', 'work');
    fixture.detectChanges();
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    const [, bottom, top] = GRAIN_CHAPTER_PALETTES.work;
    expect(host.classList.contains('has-fixed-palette')).toBeTrue();
    expect(host.style.getPropertyValue('--grain-bottom')).toBe(bottom.join(' '));
    expect(host.style.getPropertyValue('--grain-top')).toBe(top.join(' '));
    expect(observe).toHaveBeenCalledOnceWith(host);
    expect(host.querySelector('canvas')).toBeNull();
    expect(listen.calls.allArgs().some(([type]) => type === 'scroll')).toBeFalse();

    fixture.componentRef.setInput('chapter', 'projects');
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--grain-bottom')).toBe(
      GRAIN_CHAPTER_PALETTES.projects[1].join(' '),
    );
  });

  it('keeps the palette painted behind the canvas without making the host solid', () => {
    spyOn(IntersectionObserver.prototype, 'observe');
    const fixture = TestBed.createComponent(GrainGradient);
    fixture.componentRef.setInput('chapter', 'work');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const surface = host.querySelector<HTMLElement>('.grain-surface')!;
    const fallback = getComputedStyle(surface).backgroundImage;
    expect(fallback).toContain('radial-gradient');

    surface.classList.add('is-ready');
    expect(getComputedStyle(surface).backgroundImage).toBe(fallback);
    expect(getComputedStyle(host).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});

describe('GrainGradient on touch-first devices', () => {
  it('pins Firefox iOS grain to the top with a fixed paint height and no scroll animation', () => {
    spyOn(IntersectionObserver.prototype, 'observe');
    const root = document.documentElement;
    root.setAttribute('data-firefox-ios', '');
    try {
      const fixture = TestBed.createComponent(GrainGradient);
      fixture.componentRef.setInput('chapter', 'work');
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      host.style.setProperty('--grain-viewport-height', '844px');
      const style = getComputedStyle(host);
      expect(style.position).toBe('fixed');
      expect(style.animationName).toBe('none');

      const surface = host.querySelector<HTMLElement>('.grain-surface')!;
      const bounds = surface.getBoundingClientRect();
      expect(bounds.top).toBe(0);
      expect(bounds.height).toBe(844);
    } finally {
      root.removeAttribute('data-firefox-ios');
    }
  });

  it('tries Paper when the backdrop becomes visible and keeps chapter colors if WebGL is unavailable', async () => {
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      if (query.includes('pointer') || query.includes('hover')) {
        Object.defineProperty(media, 'matches', { value: query === '(pointer: coarse)' });
      }
      return media;
    });
    const contexts = spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
    const fallback = new Promise<void>((resolve) => {
      spyOn(console, 'warn').and.callFake(() => resolve());
    });
    let notify!: () => void;
    const observer = jasmine.createSpyObj<IntersectionObserver>('IntersectionObserver', ['observe', 'disconnect']);
    spyOn(window, 'IntersectionObserver').and.callFake(function (callback) {
      notify = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], observer);
      return observer;
    });
    const fixture = TestBed.createComponent(GrainGradient);
    fixture.componentRef.setInput('chapter', 'work');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(contexts).not.toHaveBeenCalled();
    notify();
    await fallback;

    const host: HTMLElement = fixture.nativeElement;
    expect(contexts).toHaveBeenCalledWith('webgl2', jasmine.objectContaining({ powerPreference: 'low-power' }));
    expect(host.style.getPropertyValue('--grain-bottom')).toBe(GRAIN_CHAPTER_PALETTES.work[1].join(' '));
    expect(host.querySelector('canvas')).toBeNull();
  });
});
