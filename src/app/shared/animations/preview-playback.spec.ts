import { observePreviewPlayback } from './preview-playback';

describe('observePreviewPlayback', () => {
  let root: HTMLElement;
  let panel: HTMLElement;
  let intersect: IntersectionObserverCallback;
  let playing: jasmine.Spy;
  let cleanup: () => void;
  let hidden: jasmine.Spy;

  beforeEach(() => {
    panel = document.createElement('article');
    root = document.createElement('div');
    panel.append(root);
    document.body.append(panel);
    spyOn(window, 'IntersectionObserver').and.callFake(function (callback) {
      intersect = callback;
      return { observe() {}, unobserve() {}, disconnect() {}, takeRecords: () => [] } as unknown as IntersectionObserver;
    });
    hidden = spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
    playing = jasmine.createSpy('playing');
    cleanup = observePreviewPlayback(root, playing, panel);
  });

  afterEach(() => {
    cleanup();
    panel.remove();
  });

  function visible(value: boolean): void {
    intersect([{ isIntersecting: value, intersectionRatio: value ? 1 : 0 } as IntersectionObserverEntry], {} as IntersectionObserver);
  }

  it('plays only when visible, selected and the document is active', async () => {
    expect(playing).toHaveBeenCalledOnceWith(false);
    visible(true);
    expect(playing.calls.mostRecent().args).toEqual([true]);
    panel.inert = true;
    await Promise.resolve();
    expect(playing.calls.mostRecent().args).toEqual([false]);
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'true');
    await Promise.resolve();
    expect(playing.calls.mostRecent().args).toEqual([false]);
    panel.removeAttribute('aria-hidden');
    await Promise.resolve();
    expect(playing.calls.mostRecent().args).toEqual([true]);
    hidden.and.returnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(playing.calls.mostRecent().args).toEqual([false]);
    hidden.and.returnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    visible(false);
    expect(playing.calls.mostRecent().args).toEqual([false]);
  });

  it('deduplicates notifications and cannot restart after disposal', () => {
    visible(true);
    visible(true);
    expect(playing.calls.allArgs()).toEqual([[false], [true]]);
    cleanup();
    cleanup();
    visible(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(playing.calls.allArgs()).toEqual([[false], [true], [false]]);
  });
});
