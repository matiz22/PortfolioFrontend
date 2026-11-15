import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function animateCertifications(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();

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

      // Read every position before writing transforms. The stationary slots are
      // the scroll triggers; their children perform the spread-out reveal.
      const entries = slots.flatMap((slot) => {
        const surface = slot.querySelector<HTMLElement>('.certifications-motion');
        const bounds = slot.getBoundingClientRect();
        if (!surface) {
          return [];
        }
        return [{
          slot,
          surface,
          aboveViewport: bounds.bottom <= 0,
          x: desktop
            ? gsap.utils.clamp(-36, 36, (wallCenter - bounds.left - bounds.width / 2) * 0.12)
            : 0,
        }];
      });
      const surfaces = new Map(entries.map((entry) => [entry.slot, entry]));
      const distance = desktop ? 18 : 14;

      for (const entry of entries) {
        // Opacity, not visibility: keyboard users can still reach every link.
        gsap.set(entry.surface, {
          opacity: 0,
          x: entry.x,
          y: entry.aboveViewport ? -distance : distance,
        });
      }

      const show = (targets: HTMLElement[]) => {
        context.add(() => {
          targets.forEach((slot, index) => {
            const entry = surfaces.get(slot);
            if (!entry) {
              return;
            }
            // Independent tweens let keyboard focus cancel one document without
            // interrupting the rest of the batch, even before its first frame.
            gsap.to(entry.surface, {
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

      const hide = (targets: HTMLElement[], direction: number) => {
        context.add(() => {
          targets.forEach((slot) => {
            const entry = surfaces.get(slot);
            // Never fade a document while its link holds keyboard focus.
            if (!entry || slot.contains(root.ownerDocument.activeElement)) {
              return;
            }
            gsap.to(entry.surface, {
              opacity: 0,
              x: entry.x * 0.5,
              y: direction * distance,
              duration: 0.28,
              delay: 0,
              ease: 'power2.in',
              overwrite: true,
            });
          });
        });
      };

      const triggers = ScrollTrigger.batch(entries.map(({ slot }) => slot), {
        start: 'top 95%',
        end: 'bottom top',
        onEnter: (targets) => show(targets as HTMLElement[]),
        onEnterBack: (targets) => show(targets as HTMLElement[]),
        onLeave: (targets) => hide(targets as HTMLElement[], -1),
        onLeaveBack: (targets) => hide(targets as HTMLElement[], 1),
      });

      const onFocus = () => {
        const focused = root.ownerDocument.activeElement;
        const slot = slots.find((candidate) => candidate.contains(focused));
        if (!slot) {
          return;
        }
        // Also finish a currently playing reveal, so focus is never obscured.
        const surface = surfaces.get(slot)?.surface;
        if (surface) {
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
