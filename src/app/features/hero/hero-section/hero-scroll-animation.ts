import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EXIT_LAYERS = [
  { selector: '.hero-portrait', x: 45, y: -90, compactY: -24, rotation: 2.25, scale: 0.94 },
  { selector: '.hero-headline', x: -30, y: -60, compactY: -27, rotation: 0, scale: 1 },
  { selector: '.hero-scroll-description', x: 0, y: -36, compactY: -18, rotation: 0, scale: 1 },
  { selector: '.hero-scroll-actions', x: 0, y: -18, compactY: -12, rotation: 0, scale: 1 },
] as const;

// Offset geometry stays stable while GSAP transforms the layers and their descendants.
function offsetWithinSection(layer: HTMLElement, section: HTMLElement): number {
  let top = 0;
  for (let element: HTMLElement | null = layer;
    element && element !== section;
    element = element.offsetParent as HTMLElement | null) {
    top += element.offsetTop;
  }
  return top;
}

export function animateHeroScroll(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const section = root.querySelector<HTMLElement>('.hero-section');
  const layout = root.querySelector<HTMLElement>('.hero-layout');
  const view = root.ownerDocument.defaultView;
  if (!section || !layout || !view) {
    return motion;
  }

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    // Follow the actual container-query layout, not an approximate viewport breakpoint.
    const isWide = () => view.getComputedStyle(layout).gridTemplateAreas === '"copy portrait"';

    const atmosphere = root.querySelector<HTMLElement>('.hero-atmosphere');
    if (atmosphere) {
      gsap.to(atmosphere, {
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }

    for (const config of EXIT_LAYERS) {
      const layer = root.querySelector<HTMLElement>(config.selector);
      if (!layer) {
        continue;
      }

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          // Never transform the trigger itself, including in the stacked layout.
          trigger: section,
          start: () => isWide()
            ? 'top top'
            : `clamp(top+=${offsetWithinSection(layer, section)} 24%)`,
          end: () => isWide()
            ? 'bottom 25%'
            : `clamp(top+=${offsetWithinSection(layer, section) + layer.offsetHeight} top)`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
        .to(layer, {
          x: () => isWide() ? config.x : 0,
          y: () => isWide() ? config.y : config.compactY,
          rotation: () => isWide() ? config.rotation : 0,
          scale: () => isWide() ? config.scale : 1,
          duration: 1,
        }, 0)
        // Keep the copy and actions readable until the final part of their exit.
        .to(layer, { autoAlpha: 0, duration: 0.28 }, 0.72);
    }

    // Refresh after deferred content or container changes, without adding scroll listeners.
    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
    resizeObserver.observe(section);
    resizeObserver.observe(layout);
    ScrollTrigger.refresh();

    return () => resizeObserver.disconnect();
  }, root);

  return motion;
}
