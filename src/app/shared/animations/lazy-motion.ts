import { afterNextRender, DestroyRef, ElementRef, inject } from '@angular/core';
import { HomeMotionLifecycle } from './home-motion-lifecycle';

type Cleanup = () => void;
type MotionSetup<T extends HTMLElement> =
  (root: T, firstActivation: boolean) => { revert(): void } | Cleanup;
type MotionLoader<T extends HTMLElement> = (root: T) => Promise<MotionSetup<T>>;

/** Call the returned function after render, and dispose it when its DOM targets change. */
export function injectLazyMotion<T extends HTMLElement = HTMLElement>() {
  const root = inject<ElementRef<T>>(ElementRef).nativeElement;
  const lifecycle = inject(HomeMotionLifecycle, { optional: true });

  return (load: MotionLoader<T>, warning: string): Cleanup => {
    let setup: MotionSetup<T> | undefined;
    let cleanup: Cleanup | undefined;
    let disposed = false;
    let firstActivation = true;
    const warn = (error: unknown) => console.warn(warning, error);
    const resume = () => {
      if (!setup || cleanup || disposed || lifecycle?.isAttached === false || !root.isConnected) {
        return;
      }
      try {
        const motion = setup(root, firstActivation);
        cleanup = typeof motion === 'function' ? motion : () => motion.revert();
        firstActivation = false;
      } catch (error) {
        warn(error);
      }
    };
    const pause = () => {
      const previous = cleanup;
      cleanup = undefined;
      try {
        previous?.();
      } catch (error) {
        warn(error);
      }
    };
    const unregister = lifecycle?.register({ resume, pause });

    void load(root).then((loaded) => {
      if (!disposed) {
        setup = loaded;
        // Remember loaded code while detached; the outlet will resume it on reattach.
        resume();
      }
    }).catch(warn);

    return () => {
      disposed = true;
      unregister?.();
      pause();
    };
  };
}

/** Register one animation for the lifetime of a component's existing DOM. */
export function afterNextRenderMotion<T extends HTMLElement = HTMLElement>(
  load: MotionLoader<T>, warning: string,
): void {
  const mount = injectLazyMotion<T>();
  const destroy = inject(DestroyRef);
  afterNextRender(() => destroy.onDestroy(mount(load, warning)));
}
