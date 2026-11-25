import { TestBed } from '@angular/core/testing';
import { FINE_POINTER_QUERY } from '../animations/motion-media';
import { GrainGradient } from './grain-gradient';
import { GRAIN_CHAPTER_PALETTES } from './grain-gradient-palette';

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
});

describe('GrainGradient on touch-first devices', () => {
  it('keeps chapter colors without requesting a GPU context even when the backdrop is visible', async () => {
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      if (query === FINE_POINTER_QUERY) {
        Object.defineProperty(media, 'matches', { value: false });
      }
      return media;
    });
    const contexts = spyOn(HTMLCanvasElement.prototype, 'getContext').and.callThrough();
    let notify: (() => void) | undefined;
    const observer = jasmine.createSpyObj<IntersectionObserver>('IntersectionObserver', ['observe', 'disconnect']);
    spyOn(window, 'IntersectionObserver').and.callFake(function (callback) {
      notify = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], observer);
      return observer;
    });
    const fixture = TestBed.createComponent(GrainGradient);
    fixture.componentRef.setInput('chapter', 'work');
    fixture.detectChanges();
    await fixture.whenStable();
    notify!();
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.getPropertyValue('--grain-bottom')).toBe(GRAIN_CHAPTER_PALETTES.work[1].join(' '));
    expect(host.querySelector('canvas')).toBeNull();
    expect(contexts).not.toHaveBeenCalled();
  });
});
