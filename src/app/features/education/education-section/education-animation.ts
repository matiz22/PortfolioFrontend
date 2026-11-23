import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Scroll wrappers hold travel; card surfaces hold cursor tilt. Splitting the
// layers keeps either animation from overwriting the other's transform.
export function animateEducationCards(root: HTMLElement): () => void {
  const motion = gsap.matchMedia();
  const cleanups: (() => void)[] = [];

  try {
    motion.add({
      animate: '(min-width: 48rem) and (prefers-reduced-motion: no-preference)',
      hover: '(hover: hover) and (pointer: fine)',
    }, (context) => {
      if (!context.conditions?.['animate']) {
        return;
      }

      const wrappers = Array.from(root.querySelectorAll<HTMLElement>('.education-motion'));
      const surfaces = new Map<HTMLElement, HTMLElement>();
      const revealed = new WeakSet<HTMLElement>();
      const triggers: ScrollTrigger[] = [];

      for (const wrapper of wrappers) {
        const surface = wrapper.firstElementChild as HTMLElement | null;
        if (!surface) {
          continue;
        }
        surfaces.set(wrapper, surface);

        if (revealed.has(wrapper)) {
          continue;
        }
        // Opacity keeps keyboard users able to reach links during any entrance.
        gsap.set(wrapper, { opacity: 0, y: 48 });
        const trigger = ScrollTrigger.create({
          trigger: wrapper,
          start: 'top 92%',
          end: 'top 40%',
          onEnter: () => {
            revealed.add(wrapper);
            gsap.to(wrapper, {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: 'power3.out',
              overwrite: true,
              clearProps: 'transform,opacity',
            });
          },
          onLeaveBack: () => {
            revealed.delete(wrapper);
            gsap.to(wrapper, {
              opacity: 0,
              y: 48,
              duration: 0.4,
              ease: 'power2.in',
              overwrite: true,
            });
          },
        });
        triggers.push(trigger);
      }

      if (context.conditions?.['hover']) {
        for (const surface of surfaces.values()) {
          const rect = surface.getBoundingClientRect();
          gsap.set(surface, {
            transformPerspective: 650,
            force3D: true,
          });

          // Two quickTo tweens reuse a single tween per property, keeping
          // pointermove cheap no matter how often the cursor crosses a card.
          const tiltX = gsap.quickTo(surface, 'rotationX', { duration: 0.6, ease: 'power3' });
          const tiltY = gsap.quickTo(surface, 'rotationY', { duration: 0.6, ease: 'power3' });

          const settle = () => {
            tiltX(0);
            tiltY(0);
          };

          const onMove = (event: PointerEvent) => {
            // A restrained tilt toward the cursor; the card stays anchored,
            // so nothing lifts or slides while the pointer travels across it.
            const xRatio = gsap.utils.clamp(0, 1, (event.clientX - rect.left) / rect.width);
            const yRatio = gsap.utils.clamp(0, 1, (event.clientY - rect.top) / rect.height);
            tiltX(gsap.utils.interpolate(3.5, -3.5, yRatio));
            tiltY(gsap.utils.interpolate(-4.5, 4.5, xRatio));
          };

          const onEnter = (event: PointerEvent) => {
            if (event.pointerType === 'touch') {
              return;
            }
            onMove(event);
          };

          const onLeave = () => settle();

          surface.addEventListener('pointerenter', onEnter);
          surface.addEventListener('pointermove', onMove);
          surface.addEventListener('pointerleave', onLeave);
          cleanups.push(() => {
            surface.removeEventListener('pointerenter', onEnter);
            surface.removeEventListener('pointermove', onMove);
            surface.removeEventListener('pointerleave', onLeave);
            // The context has already reverted both quickTo tweens and their styles.
          });
        }
      }

      return () => {
        triggers.forEach((trigger) => trigger.kill());
        cleanups.forEach((cleanup) => cleanup());
        cleanups.length = 0;
        triggers.length = 0;
      };
    }, root);
  } catch (error) {
    cleanups.forEach((cleanup) => cleanup());
    motion.revert();
    throw error;
  }

  return () => motion.revert();
}
