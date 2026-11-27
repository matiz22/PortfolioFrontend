import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioGallery } from './portfolio-gallery';

describe('PortfolioGallery', () => {
  let fixture: ComponentFixture<PortfolioGallery>;
  let host: HTMLElement;
  const pictures = ['favicon-32x32.png', 'favicon-48x48.png', 'favicon.ico']
    .map((file) => `${window.location.origin}/${file}`);

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioGallery);
    fixture.componentRef.setInput('title', 'Example project');
    fixture.componentRef.setInput('headingId', 'example-screenshots');
    host = fixture.nativeElement;
    host.style.width = '400px';
  });

  it('shows a single image without a scroll region or navigation', () => {
    fixture.componentRef.setInput('screenshots', pictures.slice(0, 1));
    fixture.detectChanges();

    expect(host.querySelector('img')?.alt).toBe('Example project, screenshot 1');
    expect(host.querySelector('.gallery-track')).toBeNull();
    expect(host.querySelector('.gallery-controls')).toBeNull();
  });

  it('leaves page-scrolling keys and browser shortcuts alone when the gallery has focus', () => {
    fixture.componentRef.setInput('screenshots', pictures);
    fixture.detectChanges();
    const track = host.querySelector<HTMLElement>('.gallery-track')!;
    const scroll = spyOn(track, 'scrollTo');

    const press = (key: string, modifiers: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true, ...modifiers });
      track.dispatchEvent(event);
      return event.defaultPrevented;
    };

    for (const key of ['Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown']) {
      expect(press(key)).withContext(key).toBeFalse();
    }
    expect(press('ArrowLeft', { altKey: true })).toBeFalse();
    expect(scroll).not.toHaveBeenCalled();

    expect(press('ArrowRight')).toBeTrue();
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it('syncs the count and boundaries with native scrolling and resets for a new project', () => {
    fixture.componentRef.setInput('screenshots', pictures);
    fixture.detectChanges();
    const track = host.querySelector<HTMLElement>('.gallery-track')!;
    const [previous, next] = host.querySelectorAll<HTMLButtonElement>('button');
    expect(track.getAttribute('aria-labelledby')).toBe('example-screenshots');
    expect(next.getAttribute('aria-controls')).toBe(track.id);
    expect(previous.disabled).toBeTrue();
    expect(next.disabled).toBeFalse();

    track.scrollLeft = track.scrollWidth - track.clientWidth;
    track.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(host.querySelector('.gallery-count')?.textContent?.trim()).toBe('03 / 03');
    expect(host.querySelector('[role="status"]')?.textContent?.trim()).toBe('Screenshot 3 of 3');
    expect(next.disabled).toBeTrue();

    fixture.componentRef.setInput('screenshots', pictures.slice().reverse());
    fixture.detectChanges();
    fixture.detectChanges();
    expect(track.scrollLeft).toBe(0);
    expect(previous.disabled).toBeTrue();
  });
});
