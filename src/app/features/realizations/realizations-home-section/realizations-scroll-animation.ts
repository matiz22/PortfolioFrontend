import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
    let pinned = false;
    let disposed = false;
    let nativeEntrance: gsap.Context | undefined;
    const enterNative = () => {
      if (disposed || pinned || nativeEntrance || !context.conditions?.['canAnimate']) return;
      context.ignore(() => {
        nativeEntrance = gsap.context(() => gsap.from(cards, {
          autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: gallery, start: 'top 80%', once: true },
        }), root);
      });
    };
    const edgeAlpha = (remaining: number) => {
      const fadeWidth = gallery.clientWidth * 0.45;
      const strength = fadeWidth > 0 ? Math.min(1, Math.max(0, remaining / fadeWidth)) : 0;
      return 1 - 0.72 * strength;
    };
    const overflow = () => {
      const last = cards[cards.length - 1];
      return Math.max(0, Math.round(last.offsetLeft + last.offsetWidth - gallery.clientWidth));
    };
    const onNativeScroll = () => {
      if (!pinned) {
        const max = gallery.scrollWidth - gallery.clientWidth;
        gallery.style.setProperty(edgeProperty, String(edgeAlpha(max - gallery.scrollLeft)));
      }
    };
    gallery.addEventListener('scroll', onNativeScroll, { passive: true });
    const observer = new ResizeObserver(onNativeScroll);
    observer.observe(gallery);
    observer.observe(track);
    onNativeScroll();

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
              pinned = true;
              // Pinned travel uses transforms, so discard a previous native swipe.
              gallery.scrollLeft = 0;
              const hold = () => Math.max(96, Math.round(overflow() * 0.3));
              const scrollRange = () => overflow() + hold();
              const applyHeadroom = () => {
                const target = `${stage.offsetHeight + scrollRange() + hold()}px`;
                if (wrap.style.height !== target) wrap.style.height = target;
              };
              let onScroll!: () => void;
              const pinContext = gsap.context(() => {
                const ease = { duration: 0.28, ease: 'power2.out' };
                const trackTo = gsap.quickTo(track, 'x', ease);
                const edgeTo = gsap.quickTo(gallery, edgeProperty, ease);
                const cardTweens = cards.map(card => ({
                  x: gsap.quickTo(card, 'x', ease), y: gsap.quickTo(card, 'y', ease),
                }));
                const smooth = (value: number) => value * value * (3 - 2 * value);
                onScroll = () => {
                  const distance = overflow();
                  if (distance <= 0) return;
                  const progress = Math.min(1, Math.max(0,
                    (-wrap.getBoundingClientRect().top - hold()) / scrollRange()));
                  const effective = Math.min(distance, progress * scrollRange());
                  trackTo(-effective);
                  edgeTo(edgeAlpha(distance - effective));
                  cards.forEach((card, i) => {
                    const span = card.offsetWidth;
                    if (span <= 0) return;
                    const t = smooth(Math.min(1, Math.max(0,
                      1 - (card.offsetLeft - effective - (gallery.clientWidth - span)) / span)));
                    cardTweens[i].x((1 - t) * 40);
                    cardTweens[i].y((1 - t) * 12);
                  });
                  reportPinnedProgress(effective / distance);
                };
              }, root);
              const refresh = () => { applyHeadroom(); onScroll(); };
              view.addEventListener('scroll', onScroll, { passive: true });
              refresh();
              return {
                refresh,
                revert: () => {
                  view.removeEventListener('scroll', onScroll);
                  pinContext.revert();
                  wrap.style.height = originalHeight;
                  pinned = false;
                  reportPinnedProgress(null);
                  onNativeScroll();
                  view.queueMicrotask(enterNative);
                },
              };
            },
          });
        });
      }
      enterNative();
    }

    return () => {
      disposed = true;
      stopPinFit?.();
      nativeEntrance?.revert();
      observer.disconnect();
      gallery.removeEventListener('scroll', onNativeScroll);
      if (originalEdgeAlpha) gallery.style.setProperty(edgeProperty, originalEdgeAlpha, originalEdgePriority);
      else gallery.style.removeProperty(edgeProperty);
    };
  }, root);
  return motion;
}
