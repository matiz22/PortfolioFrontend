import { gsap } from 'gsap';
import { FINE_POINTER_MOTION_QUERY } from '../animations/motion-media';

export function animateSectionAction(root: HTMLAnchorElement, strength: number): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const surface = root.querySelector<HTMLElement>('.section-action-surface');
  if (!surface) {
    return motion;
  }

  motion.add(
    FINE_POINTER_MOTION_QUERY,
    () => {
      let returnTween: gsap.core.Tween | undefined;
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch' || root.matches(':focus-visible')) {
          return;
        }
        // A previous return must not clear a new follow tween's transform.
        returnTween?.kill();
        returnTween = undefined;
        // Measure the stationary link, never the translated surface.
        const bounds = root.getBoundingClientRect();
        const x = gsap.utils.clamp(-strength, strength, (event.clientX - bounds.left - bounds.width / 2) * 0.2);
        const y = gsap.utils.clamp(-strength, strength, (event.clientY - bounds.top - bounds.height / 2) * 0.3);
        gsap.to(surface, {
          x, y,
          duration: 0.32,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      };

      const settle = () => {
        returnTween?.kill();
        returnTween = gsap.to(surface, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform',
        });
      };
      const focus = () => {
        returnTween?.kill();
        returnTween = undefined;
        gsap.killTweensOf(surface, 'x,y');
        gsap.set(surface, { clearProps: 'transform' });
      };

      root.addEventListener('pointerenter', move);
      root.addEventListener('pointermove', move);
      root.addEventListener('pointerleave', settle);
      root.addEventListener('pointercancel', settle);
      root.addEventListener('focus', focus);

      return () => {
        root.removeEventListener('pointerenter', move);
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerleave', settle);
        root.removeEventListener('pointercancel', settle);
        root.removeEventListener('focus', focus);
        returnTween?.kill();
        // Event-created tweens are outside the matchMedia context. Only this
        // component's inner surface is touched; never kill other page animations.
        gsap.killTweensOf(surface, 'x,y');
        gsap.set(surface, { clearProps: 'transform' });
      };
    },
    root,
  );

  return motion;
}
