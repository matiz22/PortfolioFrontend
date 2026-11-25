import { TestBed } from '@angular/core/testing';
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
