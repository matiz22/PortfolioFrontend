import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createFrameTask } from '../../../shared/animations/frame-task';
import { watchPinFit } from '../../../shared/animations/pin-fit';

gsap.registerPlugin(ScrollTrigger);

/** Visual enhancement only: native navigation and controls belong to Angular. */
export function animateRealizationsScroll(
  root: HTMLElement,
  reportPinnedProgress: (progress: number | null) => void = () => {},
): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  const section = root.querySelector<HTMLElement>('.realizations-section');
  const wrap = root.querySelector<HTMLElement>('.realizations-stage-wrap');
  const stage = root.querySelector<HTMLElement>('.realizations-stage');
  const gallery = root.querySelector<HTMLElement>('.realizations-gallery');
  const track = root.querySelector<HTMLElement>('.realizations-track');
  const cards = Array.from(root.querySelectorAll<HTMLElement>('.realization-showcase'));
  if (!view || !section || !wrap || !stage || !gallery || !track || cards.length === 0) return motion;

  motion.add({
    isWide: '(min-width: 48rem)',
    isDesktop: '(min-width: 64rem) and (min-height: 48rem)',
    canAnimate: '(prefers-reduced-motion: no-preference)',
  }, (context) => {
    if (!context.conditions?.['isWide']) return;

    const edgeProperty = '--realizations-edge-alpha';
    const originalEdgeAlpha = gallery.style.getPropertyValue(edgeProperty);
    const originalEdgePriority = gallery.style.getPropertyPriority(edgeProperty);
    const originalHeight = wrap.style.height;
    let renderPinned: (() => void) | undefined;
    let disposed = false;
    let nativeEntrance: gsap.Context | undefined;
    const enterNative = () => {
      if (disposed || renderPinned || nativeEntrance || !context.conditions?.['canAnimate']) return;
      context.ignore(() => {
        nativeEntrance = gsap.context(() => gsap.from(cards, {
          autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: gallery, start: 'top 80%', once: true },
        }), root);
      });
    };
    const edgeAlpha = (remaining: number, width: number) => {
      const fadeWidth = width * 0.45;
      const strength = fadeWidth > 0 ? Math.min(1, Math.max(0, remaining / fadeWidth)) : 0;
      return 1 - 0.72 * strength;
    };
    const overflow = () => {
      const last = cards[cards.length - 1];
      return Math.max(0, Math.round(last.offsetLeft + last.offsetWidth - gallery.clientWidth));
    };
    let nativeGeometry: { width: number; max: number } | undefined;
    let geometryDirty = true;
    const renderNative = () => {
      if (!nativeGeometry || geometryDirty) {
        const width = gallery.clientWidth;
        nativeGeometry = { width, max: gallery.scrollWidth - width };
        geometryDirty = false;
      }
      const alpha = String(edgeAlpha(nativeGeometry.max - gallery.scrollLeft, nativeGeometry.width));
      if (gallery.style.getPropertyValue(edgeProperty) !== alpha) gallery.style.setProperty(edgeProperty, alpha);
    };
    const draw = createFrameTask(view, () => renderPinned ? renderPinned() : renderNative());
    const invalidate = () => {
      geometryDirty = true;
      draw.request();
    };
    const onNativeScroll = () => {
      if (!renderPinned) draw.request();
    };
    renderNative();

    let stopPinFit: (() => void) | undefined;
    if (context.conditions['canAnimate']) {
      if (context.conditions['isDesktop']) {
        // Fit owns the nested context. Avoid a second outer-context revert.
        context.ignore(() => {
          stopPinFit = watchPinFit({
            section, stage, pinnedClass: 'realizations-is-pinned',
            observe: [gallery, track], eligible: () => overflow() > 0,
            mount: () => {
              nativeEntrance?.revert();
              nativeEntrance = undefined;
              // Pinned travel uses transforms, so discard a previous native swipe.
              gallery.scrollLeft = 0;
              const measure = () => {
                const width = gallery.clientWidth;
                const bounds = cards.map(card => ({ left: card.offsetLeft, span: card.offsetWidth }));
                const last = bounds[bounds.length - 1];
                const distance = Math.max(0, Math.round(last.left + last.span - width));
                const hold = Math.max(96, Math.round(distance * 0.3));
                return { width, bounds, distance, hold, headroom: stage.offsetHeight + distance + hold * 2 };
              };
              let geometry: ReturnType<typeof measure> | undefined;
              let previousTravel: number | undefined;
              const pinContext = gsap.context(() => {
                const ease = { duration: 0.28, ease: 'power2.out' };
                const trackTo = gsap.quickTo(track, 'x', ease);
                const edgeTo = gsap.quickTo(gallery, edgeProperty, ease);
                const cardTweens = cards.map(card => ({
                  x: gsap.quickTo(card, 'x', ease), y: gsap.quickTo(card, 'y', ease),
                }));
                const smooth = (value: number) => value * value * (3 - 2 * value);
                renderPinned = () => {
                  const next = geometryDirty || !geometry ? measure() : geometry;
                  const remeasure = next !== geometry;
                  if (remeasure) {
                    geometry = next;
                    geometryDirty = false;
                    previousTravel = undefined;
                  }
                  const { width, bounds, distance, hold, headroom } = next;
                  // Keep one live positional read: deferred chapters above Work
                  // can move the wrapper without changing its dimensions.
                  const effective = Math.min(distance, Math.max(0, -wrap.getBoundingClientRect().top - hold));
                  if (remeasure && wrap.style.height !== `${headroom}px`) wrap.style.height = `${headroom}px`;
                  if (distance <= 0 || effective === previousTravel) return;
                  previousTravel = effective;
                  trackTo(-effective);
                  edgeTo(edgeAlpha(distance - effective, width));
                  bounds.forEach(({ left, span }, i) => {
                    if (span <= 0) return;
                    const t = smooth(Math.min(1, Math.max(0, 1 - (left - effective - (width - span)) / span)));
                    cardTweens[i].x((1 - t) * 40);
                    cardTweens[i].y((1 - t) * 12);
                  });
                  reportPinnedProgress(effective / distance);
                };
              }, root);
              view.addEventListener('scroll', draw.request, { passive: true });
              renderPinned?.();
              return {
                refresh: invalidate,
                revert: () => {
                  view.removeEventListener('scroll', draw.request);
                  pinContext.revert();
                  wrap.style.height = originalHeight;
                  renderPinned = undefined;
                  reportPinnedProgress(null);
                  invalidate();
                  view.queueMicrotask(enterNative);
                },
              };
            },
          });
        });
      }
      enterNative();
    }
    gallery.addEventListener('scroll', onNativeScroll, { passive: true });
    view.addEventListener('resize', invalidate);
    const observer = view.ResizeObserver ? new view.ResizeObserver(invalidate) : undefined;
    observer?.observe(gallery);
    observer?.observe(track);

    return () => {
      disposed = true;
      draw.dispose();
      stopPinFit?.();
      nativeEntrance?.revert();
      observer?.disconnect();
      view.removeEventListener('resize', invalidate);
      gallery.removeEventListener('scroll', onNativeScroll);
      if (originalEdgeAlpha) gallery.style.setProperty(edgeProperty, originalEdgeAlpha, originalEdgePriority);
      else gallery.style.removeProperty(edgeProperty);
    };
  }, root);
  return motion;
}
