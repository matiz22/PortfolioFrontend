import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function animateCertifications(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  // Preserve completed reveals when changing between desktop and mobile layouts.
  const revealed = new WeakSet<HTMLElement>();

  try {
    motion.add({
      animate: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 48rem)',
    }, (context) => {
      if (!context.conditions?.['animate']) {
        return;
      }

      const wall = root.querySelector<HTMLElement>('.certifications-wall');
      if (!wall) {
        return;
      }
      const desktop = context.conditions['desktop'];
      const wallBounds = wall.getBoundingClientRect();
      const wallCenter = wallBounds.left + wallBounds.width / 2;
      const slots = Array.from(wall.querySelectorAll<HTMLElement>('.certifications-slot'));
      const surfaces = new Map<HTMLElement, HTMLElement>();

      // Read every position before writing transforms. The stationary slots are
      // the scroll triggers; their children perform the spread-out reveal.
      const entries = slots.flatMap((slot) => {
        const surface = slot.querySelector<HTMLElement>('.certifications-motion');
        const bounds = slot.getBoundingClientRect();
        if (!surface || revealed.has(slot) || bounds.bottom <= 0) {
          return [];
        }
        surfaces.set(slot, surface);
        return [{
          slot,
          surface,
          x: desktop
            ? gsap.utils.clamp(-36, 36, (wallCenter - bounds.left - bounds.width / 2) * 0.12)
            : 0,
        }];
      });

      for (const entry of entries) {
        // Opacity, not visibility: keyboard users can still reach every link.
        gsap.set(entry.surface, {
          opacity: 0,
          x: entry.x,
          y: desktop ? 18 : 14,
        });
      }

      const show = (targets: HTMLElement[]) => {
        const pending = targets.filter((slot) => !revealed.has(slot) && surfaces.has(slot));
        if (!pending.length) {
          return;
        }
        context.add(() => {
          pending.forEach((slot, index) => {
            revealed.add(slot);
            // Independent tweens let keyboard focus cancel one document without
            // interrupting the rest of the batch, even before its first frame.
            gsap.to(surfaces.get(slot)!, {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.6,
              delay: index * 0.08,
              ease: 'power3.out',
              overwrite: true,
              clearProps: 'transform,opacity',
            });
          });
        });
      };

      const triggers = ScrollTrigger.batch(entries.map(({ slot }) => slot), {
        start: 'top 95%',
        once: true,
        onEnter: (targets) => show(targets as HTMLElement[]),
      });

      const onFocus = () => {
        const focused = root.ownerDocument.activeElement;
        const slot = slots.find((candidate) => candidate.contains(focused));
        if (!slot) {
          return;
        }
        // Also finish a currently playing reveal, so focus is never obscured.
        const surface = surfaces.get(slot);
        if (surface) {
          revealed.add(slot);
          context.add(() => {
            gsap.killTweensOf(surface);
            gsap.set(surface, { clearProps: 'transform,opacity' });
          });
        }
      };
      root.addEventListener('focusin', onFocus);
      onFocus();

      return () => {
        root.removeEventListener('focusin', onFocus);
        triggers.forEach((trigger) => trigger.kill());
      };
    }, root);
  } catch (error) {
    motion.revert();
    throw error;
  }

  return motion;
}
