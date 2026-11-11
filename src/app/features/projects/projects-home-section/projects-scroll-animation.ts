import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function animateProjectsScroll(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  const header = root.querySelector<HTMLElement>('.projects-home-header');
  const items = Array.from(root.querySelectorAll<HTMLElement>('.projects-home-item'));

  if (!view || (!header && items.length === 0)) {
    return motion;
  }

  motion.add(
    {
      canAnimate: '(prefers-reduced-motion: no-preference)',
    },
    () => {
      if (!header) {
        return;
      }

      // Heading and description rise gently on first view.
      const headerBits = Array.from(header.querySelectorAll<HTMLElement>('.projects-home-reveal'));
      if (headerBits.length > 0) {
        gsap.set(headerBits, { autoAlpha: 0, y: 24 });
        gsap.to(headerBits, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 82%',
            once: true,
          },
        });
      }

      // Cards appear row by row while scrolling through the grid.
      if (items.length > 0) {
        gsap.set(items, { autoAlpha: 0, y: 30 });
        ScrollTrigger.batch(items, {
          interval: 0.1,
          start: 'top 85%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              overwrite: true,
            }),
        });
        ScrollTrigger.refresh();
      }
    },
    root
  );

  return motion;
}
