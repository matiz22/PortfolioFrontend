import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeRailControls } from './home-rail-controls';

describe('HomeRailControls', () => {
  let fixture: ComponentFixture<HomeRailControls>;
  let viewport: HTMLElement;
  let mobile: boolean;
  let reducedMotion: boolean;
  let mobileQuery: MediaQueryList;

  beforeEach(() => {
    mobile = true;
    reducedMotion = false;
    const matchMedia = window.matchMedia.bind(window);
    mobileQuery = matchMedia('(width < 48rem)');
    Object.defineProperty(mobileQuery, 'matches', { get: () => mobile });
    spyOn(window, 'matchMedia').and.callFake((query) => {
      if (query === '(width < 48rem)') {
        return mobileQuery;
      }
      const media = matchMedia(query);
      if (query === '(prefers-reduced-motion: reduce)') {
        Object.defineProperty(media, 'matches', { get: () => reducedMotion });
      }
      return media;
    });

    viewport = document.createElement('div');
    viewport.id = 'test-card-rail';
    viewport.style.cssText = `
      display: flex; box-sizing: border-box; width: 320px; height: 40px;
      gap: 16px; padding-inline: 24px; overflow-x: auto;
      scroll-padding-inline: 24px;
    `;
    document.body.append(viewport);
    for (let i = 0; i < 3; i++) {
      const card = document.createElement('article');
      card.style.flex = '0 0 250px';
      card.setAttribute('data-home-rail-item', '');
      viewport.append(card);
    }

    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HomeRailControls);
    fixture.componentRef.setInput('viewport', viewport);
    fixture.componentRef.setInput('headingId', 'test-heading');
    fixture.nativeElement.style.display = 'block';
  });

  afterEach(() => {
    fixture.destroy();
    viewport.remove();
  });

  const buttons = (): HTMLButtonElement[] => [...fixture.nativeElement.querySelectorAll('button')];
  const spyScroll = () => spyOn(viewport as { scrollTo(options: ScrollToOptions): void }, 'scrollTo');
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const scroll = async (left: number) => {
    viewport.scrollLeft = left;
    viewport.dispatchEvent(new Event('scroll'));
    await render();
  };

  const mutateCards = async (change: () => void) => {
    await new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        observer.disconnect();
        resolve();
      });
      observer.observe(viewport, { childList: true });
      change();
    });
    await render();
  };

  it('adds labelled controls and scrolls by one card without moving focus', async () => {
    await render();
    const [previous, next] = buttons();
    expect(next.getAttribute('aria-controls')).toBe(viewport.id);
    expect(next.closest('[role="group"]')?.getAttribute('aria-labelledby')).toBe('test-heading');
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect(next.getAttribute('aria-disabled')).toBe('false');

    const move = spyScroll();
    previous.click();
    expect(move).not.toHaveBeenCalled();
    next.focus();
    next.click();
    expect(move).toHaveBeenCalledOnceWith({ left: 266, behavior: 'smooth' });
    expect(document.activeElement).toBe(next);
  });

  it('syncs after native scrolling and reaches the final card with reduced motion', async () => {
    reducedMotion = true;
    await render();
    const [previous, next] = buttons();
    const max = viewport.scrollWidth - viewport.clientWidth;
    const move = spyScroll();

    await scroll(266);
    expect(previous.getAttribute('aria-disabled')).toBe('false');
    next.click();
    expect(move).toHaveBeenCalledOnceWith({ left: max, behavior: 'instant' });

    await scroll(max);
    expect(next.getAttribute('aria-disabled')).toBe('true');
    next.click();
    expect(move).toHaveBeenCalledTimes(1);
    previous.click();
    expect(move).toHaveBeenCalledWith({ left: 266, behavior: 'instant' });

    await scroll(0);
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect(next.getAttribute('aria-disabled')).toBe('false');
  });

  it('keeps controls hidden on desktop, for one real card, or when the cards fit', async () => {
    mobile = false;
    await render();
    expect(buttons()).toHaveSize(0);

    mobile = true;
    mobileQuery.dispatchEvent(new Event('change'));
    await render();
    expect(buttons()).toHaveSize(2);

    viewport.style.width = '1000px';
    await new Promise<void>((resolve) => {
      const observer = new ResizeObserver(() => {
        observer.disconnect();
        resolve();
      });
      observer.observe(viewport);
    });
    await render();
    expect(buttons()).toHaveSize(0);

    viewport.style.width = '320px';
    // Non-card placeholders still overflow, but should never produce controls.
    await mutateCards(() => {
      for (const card of [...viewport.children].slice(1)) {
        const placeholder = card.cloneNode() as HTMLElement;
        placeholder.removeAttribute('data-home-rail-item');
        card.replaceWith(placeholder);
      }
    });
    expect(buttons()).toHaveSize(0);

    await mutateCards(() => {
      viewport.lastElementChild!.replaceWith(viewport.firstElementChild!.cloneNode());
    });
    expect(buttons()).toHaveSize(2);
  });

  it('uses reachable stops on a wide native rail without loading animation code', async () => {
    mobile = false;
    viewport.style.cssText = 'display:flex;width:900px;height:40px;gap:24px;overflow-x:auto;';
    [...viewport.children].forEach(card => (card as HTMLElement).style.flex = '0 0 450px');
    fixture.componentRef.setInput('scope', 'responsive');
    fixture.componentRef.setInput('showProgress', true);
    await render();
    const [previous, next] = buttons();
    const move = spyScroll();
    expect(next).toBeDefined();

    // Three cards, two visible: the final reachable stop precedes the last card's edge.
    await scroll(viewport.scrollWidth - viewport.clientWidth);
    previous.click();
    expect(move).toHaveBeenCalledWith({ left: 474, behavior: 'smooth' });
    await scroll(474);
    previous.click();
    expect(move).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
    await scroll(0);
    next.click();
    expect(move).toHaveBeenCalledWith({ left: 474, behavior: 'smooth' });
  });

  it('shows pinned progress and restores working native controls after pin cleanup', async () => {
    mobile = false;
    fixture.componentRef.setInput('scope', 'responsive');
    fixture.componentRef.setInput('showProgress', true);
    await render();
    viewport.style.overflowX = 'hidden';
    fixture.componentInstance.setPinnedProgress(0.65);
    await render();
    expect(buttons()).toHaveSize(0);
    const progress: HTMLElement = fixture.nativeElement.querySelector('.rail-progress > span');
    expect(progress.style.transform).toBe('scaleX(0.65)');

    fixture.componentInstance.setPinnedProgress(null);
    viewport.style.overflowX = 'auto';
    await render();
    expect(buttons()).toHaveSize(2);
    const move = spyScroll();
    buttons()[1].click();
    expect(move).toHaveBeenCalledOnceWith({ left: 266, behavior: 'smooth' });
  });
});
