import { gsap } from 'gsap';

import { renderHeroDither } from './hero-gradient-dither';

export function animateHeroGradient(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const fields = Array.from(root.querySelectorAll<HTMLElement>('.hero-gradient-field'));
  if (!fields.length) {
    return motion;
  }

  // This context is always active: reduced-motion and touch users still get the texture.
  motion.add({ all: 'all' }, () => renderHeroDither(root), root);

  motion.add(
    '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
    () => {
      // Reuse four transform tweens rather than allocating animations on every move.
      const followers = fields.map((field, index) => ({
        depth: index === 0 ? 1 : -0.65,
        x: gsap.quickTo(field, 'x', { duration: 1.1, ease: 'power3.out' }),
        y: gsap.quickTo(field, 'y', { duration: 1.1, ease: 'power3.out' }),
      }));

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch') {
          return;
        }

        // Read once before updating either layer; client coordinates stay correct on scroll.
        const bounds = root.getBoundingClientRect();
        if (!bounds.width || !bounds.height) {
          return;
        }

        const x = gsap.utils.clamp(-1, 1, (event.clientX - bounds.left) / bounds.width * 2 - 1);
        const y = gsap.utils.clamp(-1, 1, (event.clientY - bounds.top) / bounds.height * 2 - 1);
        const travelX = Math.min(bounds.width * 0.12, 140);
        const travelY = Math.min(bounds.height * 0.12, 100);

        for (const follower of followers) {
          follower.x(x * travelX * follower.depth);
          follower.y(y * travelY * follower.depth);
        }
      };

      const onPointerLeave = (event: PointerEvent) => {
        if (event.pointerType === 'touch') {
          return;
        }

        for (const follower of followers) {
          follower.x(0);
          follower.y(0);
        }
      };

      root.addEventListener('pointerenter', onPointerMove);
      root.addEventListener('pointermove', onPointerMove);
      root.addEventListener('pointerleave', onPointerLeave);
      root.addEventListener('pointercancel', onPointerLeave);

      return () => {
        root.removeEventListener('pointerenter', onPointerMove);
        root.removeEventListener('pointermove', onPointerMove);
        root.removeEventListener('pointerleave', onPointerLeave);
        root.removeEventListener('pointercancel', onPointerLeave);
      };
    },
    root,
  );

  return motion;
}
