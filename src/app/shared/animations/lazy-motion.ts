import { afterNextRender, DestroyRef, ElementRef, inject } from '@angular/core';
import { HomeMotionLifecycle } from './home-motion-lifecycle';

type Cleanup = () => void;
type MotionSetup<T extends HTMLElement> =
  (root: T, firstActivation: boolean) => { revert(): void } | Cleanup;
type MotionLoader<T extends HTMLElement> = (root: T) => Promise<MotionSetup<T>>;

/**
 * Resolves once the initial page load has settled, so optional animation
 * downloads never compete with the resources the LCP element needs. Returns
 * undefined when the page is already loaded (client navigation, tests).
 */
function pageLoadSettled(root: HTMLElement): Promise<void> | undefined {
  const view = root.ownerDocument.defaultView;
  if (!view || view.document.readyState === 'complete') {
    return undefined;
  }
  return new Promise((resolve) => {
    view.addEventListener('load', () => resolve(), { once: true });
  });
}

/** Call the returned function after render, and dispose it when its DOM targets change. */
export function injectLazyMotion<T extends HTMLElement = HTMLElement>() {
  const root = inject<ElementRef<T>>(ElementRef).nativeElement;
  const lifecycle = inject(HomeMotionLifecycle, { optional: true });

  return (load: MotionLoader<T>, warning: string, mediaQuery?: string,
    deferDownload?: boolean): Cleanup => {
    const media = mediaQuery ? root.ownerDocument.defaultView?.matchMedia(mediaQuery) : undefined;
    let setup: MotionSetup<T> | undefined;
    let cleanup: Cleanup | undefined;
    let disposed = false;
    let loadingStarted = false;
    let firstActivation = true;
    const warn = (error: unknown) => console.warn(warning, error);
    const revert = () => {
      const previous = cleanup;
      cleanup = undefined;
      try {
        previous?.();
      } catch (error) {
        warn(error);
      }
    };
    const startLoading = () => {
      void load(root).then((loaded) => {
        if (disposed) return;
        // Imports can't be canceled. Keep the initializer without mounting it
        // if the route or media query stopped matching while it was in flight.
        setup = loaded;
        sync();
      }).catch(warn);
    };
    const sync = () => {
      if (disposed || lifecycle?.isAttached === false || !root.isConnected) return;
      if (mediaQuery && !media?.matches) {
        revert();
        return;
      }
      if (!loadingStarted) {
        loadingStarted = true;
        const settled = deferDownload ? pageLoadSettled(root) : undefined;
        if (!settled) {
          startLoading();
          return;
        }
        // Keep the download out of the critical page-load window. Once the page
        // has loaded, hand control back to sync() so it applies the same
        // eligibility checks as any later resume.
        void settled.then(() => {
          if (disposed) return;
          loadingStarted = false;
          sync();
        });
      } else if (setup && !cleanup) {
        try {
          const motion = setup(root, firstActivation);
          cleanup = typeof motion === 'function' ? motion : () => motion.revert();
          firstActivation = false;
        } catch (error) {
          warn(error);
        }
      }
    };
    const resume = () => {
      media?.addEventListener('change', sync);
      sync();
    };
    const pause = () => {
      media?.removeEventListener('change', sync);
      revert();
    };
    const unregister = lifecycle?.register({ resume, pause });
    if (lifecycle?.isAttached !== false) resume();

    return () => {
      disposed = true;
      unregister?.();
      pause();
    };
  };
}

/** Register one animation for the lifetime of a component's existing DOM. */
export function afterNextRenderMotion<T extends HTMLElement = HTMLElement>(
  load: MotionLoader<T>, warning: string, mediaQuery?: string, deferDownload?: boolean,
): void {
  const mount = injectLazyMotion<T>();
  const destroy = inject(DestroyRef);
  afterNextRender(() => destroy.onDestroy(mount(load, warning, mediaQuery, deferDownload)));
}
