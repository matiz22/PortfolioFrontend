import { watchPinFit } from './pin-fit';

describe('watchPinFit', () => {
  let section: HTMLElement;
  let stage: HTMLElement;
  let height: number;
  let flush: () => void;
  let resized: ResizeObserverCallback;
  let cleanup: (() => void) | undefined;
  let instance: { refresh: jasmine.Spy; revert: jasmine.Spy };
  let mount: jasmine.Spy;

  beforeEach(() => {
    height = window.innerHeight - 10;
    section = document.createElement('section');
    stage = document.createElement('div');
    section.append(stage);
    document.body.append(section);
    Object.defineProperty(stage, 'offsetHeight', { get: () => height });
    spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      flush = () => callback(0);
      return 1;
    });
    spyOn(window, 'cancelAnimationFrame');
    spyOn(window, 'ResizeObserver').and.callFake(function (callback) {
      resized = callback;
      return {
        observe: () => undefined,
        unobserve: () => undefined,
        disconnect: () => undefined,
      } satisfies ResizeObserver;
    });
    instance = { refresh: jasmine.createSpy('refresh'), revert: jasmine.createSpy('revert') };
    mount = jasmine.createSpy('mount').and.returnValue(instance);
  });

  afterEach(() => {
    cleanup?.();
    section.remove();
  });

  const resize = () => resized([], {} as ResizeObserver);

  function start(options?: { eligible?: () => boolean; tolerance?: number }): void {
    cleanup = watchPinFit({ section, stage, pinnedClass: 'pinned', observe: [], mount, ...options });
  }

  it('mounts synchronously, tolerates small drift, and releases on real overflow', () => {
    start({ tolerance: 12 });
    expect(mount).toHaveBeenCalledTimes(1);
    expect(section.classList.contains('pinned')).toBeTrue();
    height = window.innerHeight + 4;
    resize();
    flush();
    expect(instance.revert).not.toHaveBeenCalled();
    expect(section.classList.contains('pinned')).toBeTrue();
    height = window.innerHeight + 20;
    resize();
    flush();
    // The first overflowing check only schedules a confirmation pass.
    flush();
    expect(instance.revert).toHaveBeenCalledTimes(1);
    expect(section.classList.contains('pinned')).toBeFalse();
    height = window.innerHeight - 20;
    resize();
    flush();
    expect(mount).toHaveBeenCalledTimes(2);
    expect(section.classList.contains('pinned')).toBeTrue();
  });

  it('refuses a fresh mount that overflows the viewport at all', () => {
    height = window.innerHeight + 4;
    start();
    expect(mount).not.toHaveBeenCalled();
    expect(section.classList.contains('pinned')).toBeFalse();
    resize();
    flush();
    resize();
    flush();
    expect(mount).not.toHaveBeenCalled();
  });

  it('coalesces size notifications and ignores drift below the refresh epsilon', () => {
    start();
    resize();
    resize();
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    flush();
    expect(instance.refresh).not.toHaveBeenCalled();
    height -= 3;
    resize();
    flush();
    expect(instance.refresh).not.toHaveBeenCalled();
    height -= 8;
    resize();
    flush();
    expect(instance.refresh).toHaveBeenCalledTimes(1);
    resize();
    flush();
    expect(instance.refresh).toHaveBeenCalledTimes(1);
  });

  it('keeps an active pin across small overflows a fresh mount would refuse', () => {
    start({ tolerance: 12 });
    height = window.innerHeight + 8;
    resize();
    flush();
    expect(mount).toHaveBeenCalledTimes(1);
    expect(section.classList.contains('pinned')).toBeTrue();
    expect(instance.revert).not.toHaveBeenCalled();
  });

  it('checks extra eligibility and cleans up scheduled work exactly once', () => {
    let eligible = false;
    start({ eligible: () => eligible });
    expect(mount).not.toHaveBeenCalled();
    eligible = true;
    window.dispatchEvent(new Event('resize'));
    flush();
    expect(mount).toHaveBeenCalledTimes(1);
    resize();
    cleanup!();
    cleanup!();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(instance.revert).toHaveBeenCalledTimes(1);
    flush();
    expect(mount).toHaveBeenCalledTimes(1);
    expect(section.classList.contains('pinned')).toBeFalse();
  });
});
