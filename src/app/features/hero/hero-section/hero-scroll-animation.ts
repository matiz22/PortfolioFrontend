import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createFrameTask } from '../../../shared/animations/frame-task';
import { MOTION_ALLOWED_QUERY } from '../../../shared/animations/motion-media';

gsap.registerPlugin(ScrollTrigger);

const EXIT_LAYERS = [
  {
    selector: '.hero-portrait', x: 45, y: -90, rotation: 2.25, scale: 0.94,
    compact: { x: 32, y: 0, rotation: 1.25, scale: 0.96 },
  },
  {
    selector: '.hero-headline', x: -30, y: -60, rotation: 0, scale: 1,
    compact: { x: -24, y: 0, rotation: 0, scale: 1 },
  },
  {
    selector: '.hero-scroll-description', x: -30, y: -36, rotation: 0, scale: 1,
    startWith: '.hero-headline',
    compact: { x: -24, y: 0, rotation: 0, scale: 1 },
  },
] as const;

// Offset geometry stays stable while GSAP transforms the layers and their descendants.
function offsetWithinSection(
  layer: HTMLElement,
  section: HTMLElement,
  property: 'offsetTop' | 'offsetLeft' = 'offsetTop',
): number {
  let offset = 0;
  for (let element: HTMLElement | null = layer;
    element && element !== section;
    element = element.offsetParent as HTMLElement | null) {
    offset += element[property];
  }
  return offset;
}

export function animateHeroScroll(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const section = root.querySelector<HTMLElement>('.hero-section');
  const layout = root.querySelector<HTMLElement>('.hero-layout');
  const view = root.ownerDocument.defaultView;
  if (!section || !layout || !view) {
    return motion;
  }

  motion.add(MOTION_ALLOWED_QUERY, () => {
    // Follow the actual container-query layout, not an approximate viewport breakpoint.
    const isWide = () => view.getComputedStyle(layout).gridTemplateAreas === '"copy portrait"';

    for (const config of EXIT_LAYERS) {
      const layer = root.querySelector<HTMLElement>(config.selector);
      if (!layer) {
        continue;
      }
      // Let the description join the headline's exit instead of waiting until it reaches the top.
      const compactStart = 'startWith' in config
        ? root.querySelector<HTMLElement>(config.startWith) ?? layer
        : layer;

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          // Never transform the trigger itself, including in the stacked layout.
          trigger: section,
          start: () => isWide()
            ? 'top top'
            // Start while each block is still around mid-screen, not already at the top edge.
            : `clamp(top+=${offsetWithinSection(compactStart, section)} 55%)`,
          end: () => isWide()
            ? 'bottom 25%'
            : `clamp(top+=${offsetWithinSection(layer, section) + layer.offsetHeight} top)`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
        .to(layer, {
          x: () => {
            if (isWide()) {
              return config.x;
            }
            // Use untransformed bounds so narrow screens never lose content off either edge.
            const left = offsetWithinSection(layer, section, 'offsetLeft');
            return gsap.utils.clamp(
              -Math.max(0, left),
              Math.max(0, section.clientWidth - left - layer.offsetWidth),
              config.compact.x,
            );
          },
          y: () => isWide() ? config.y : config.compact.y,
          rotation: () => isWide() ? config.rotation : config.compact.rotation,
          scale: () => isWide() ? config.scale : config.compact.scale,
          duration: 1,
        }, 0)
        // Keep the copy readable until the final part of its exit.
        .to(layer, { autoAlpha: 0, duration: 0.28 }, 0.72);
    }

    // Refresh after deferred content or container changes, without adding scroll listeners.
    const refresh = createFrameTask(view, () => ScrollTrigger.refresh());
    const resizeObserver = view.ResizeObserver ? new view.ResizeObserver(refresh.request) : undefined;
    resizeObserver?.observe(section);
    resizeObserver?.observe(layout);
    ScrollTrigger.refresh();

    return () => {
      resizeObserver?.disconnect();
      refresh.dispose();
    };
  }, root);

  return motion;
}
