import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HomeMotionLifecycle } from './home-motion-lifecycle';
import { injectLazyMotion } from './lazy-motion';
import { FINE_POINTER_MOTION_QUERY, MOTION_ALLOWED_QUERY } from './motion-media';

describe('media-gated lazy motion', () => {
  let root: HTMLElement;
  let lifecycle: HomeMotionLifecycle;
  let matches: boolean;
  let media: MediaQueryList;
  let matchMedia: jasmine.Spy<typeof window.matchMedia>;
  let dispose: (() => void) | undefined;

  function changeMatch(value: boolean): void {
    matches = value;
    media.dispatchEvent(new Event('change'));
  }

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
    lifecycle = new HomeMotionLifecycle();
    matches = false;
    media = new EventTarget() as MediaQueryList;
    Object.defineProperty(media, 'matches', { get: () => matches });
    matchMedia = spyOn(window, 'matchMedia').and.returnValue(media);
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: new ElementRef(root) },
        { provide: HomeMotionLifecycle, useValue: lifecycle },
      ],
    });
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    root.remove();
  });

  it('loads only when motion and pointer capability match, and only once across changes', async () => {
    const cleanup = jasmine.createSpy('cleanup');
    const setup = jasmine.createSpy('setup').and.returnValue(cleanup);
    const load = jasmine.createSpy('load').and.resolveTo(setup);
    const mount = TestBed.runInInjectionContext(() => injectLazyMotion());
    dispose = mount(load, 'Unexpected load failure', FINE_POINTER_MOTION_QUERY);
    expect(matchMedia).toHaveBeenCalledOnceWith(FINE_POINTER_MOTION_QUERY);
    expect(load).not.toHaveBeenCalled();

    changeMatch(true);
    await Promise.resolve();
    expect(load).toHaveBeenCalledOnceWith(root);
    expect(setup).toHaveBeenCalledOnceWith(root, true);

    changeMatch(false);
    expect(cleanup).toHaveBeenCalledTimes(1);
    changeMatch(true);
    expect(setup.calls.mostRecent().args).toEqual([root, false]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledTimes(2);

    dispose();
    dispose = undefined;
    expect(cleanup).toHaveBeenCalledTimes(2);
    changeMatch(true);
    expect(setup).toHaveBeenCalledTimes(2);
  });

  it('does not start imports while detached or mount an import that resolves after eligibility changes', async () => {
    const cleanup = jasmine.createSpy('cleanup');
    const setup = jasmine.createSpy('setup').and.returnValue(cleanup);
    let finish!: (value: typeof setup) => void;
    const load = jasmine.createSpy('load').and.returnValue(new Promise<typeof setup>(resolve => {
      finish = resolve;
    }));
    const removed = spyOn(media, 'removeEventListener').and.callThrough();
    const mount = TestBed.runInInjectionContext(() => injectLazyMotion());
    dispose = mount(load, 'Unexpected load failure', `(min-width: 48rem) and ${MOTION_ALLOWED_QUERY}`);
    lifecycle.detach();
    expect(removed).toHaveBeenCalledWith('change', jasmine.any(Function));
    changeMatch(true);
    expect(load).not.toHaveBeenCalled();

    lifecycle.attach();
    expect(load).toHaveBeenCalledOnceWith(root);
    changeMatch(false);
    finish(setup);
    await Promise.resolve();
    expect(setup).not.toHaveBeenCalled();

    changeMatch(true);
    expect(setup).toHaveBeenCalledOnceWith(root, true);
    lifecycle.detach();
    expect(cleanup).toHaveBeenCalledTimes(1);
    changeMatch(false);
    lifecycle.attach();
    expect(setup).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
