import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function animateRealizationsScroll(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  const section = root.querySelector<HTMLElement>('.realizations-section');
  const wrap = root.querySelector<HTMLElement>('.realizations-stage-wrap');
  const stage = root.querySelector<HTMLElement>('.realizations-stage');
  const gallery = root.querySelector<HTMLElement>('.realizations-gallery');
  const track = root.querySelector<HTMLElement>('.realizations-track');
  const fill = root.querySelector<HTMLElement>('.realizations-rail-fill');
  const prevButton = root.querySelector<HTMLButtonElement>('.realizations-nav-prev');
  const nextButton = root.querySelector<HTMLButtonElement>('.realizations-nav-next');
  const cards = Array.from(root.querySelectorAll<HTMLElement>('.realization-showcase'));

  if (!view || !section || !wrap || !stage || !gallery || !track || cards.length === 0) {
    return motion;
  }

  motion.add(
    {
      // Navigation still needs listeners on small screens with reduced motion.
      all: 'all',
      isDesktop: '(min-width: 64rem) and (min-height: 48rem)',
      canAnimate: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const canAnimate = context.conditions?.['canAnimate'] === true;
      const isDesktop = context.conditions?.['isDesktop'] === true;

      let activeIndex = 0;
      const edgeProperty = '--realizations-edge-alpha';
      const originalEdgeAlpha = gallery.style.getPropertyValue(edgeProperty);
      const originalEdgePriority = gallery.style.getPropertyPriority(edgeProperty);
      const edgeAlpha = (remaining: number) => {
        const fadeWidth = gallery.clientWidth * 0.45;
        const strength = fadeWidth > 0 ? Math.min(1, Math.max(0, remaining / fadeWidth)) : 0;
        return 1 - 0.72 * strength;
      };

      const syncNavButtons = () => {
        if (prevButton) {
          prevButton.disabled = activeIndex === 0;
        }
        if (nextButton) {
          nextButton.disabled = activeIndex >= cards.length - 1;
        }
      };

      const syncProgress = (progress: number) => {
        activeIndex = Math.min(cards.length - 1, Math.max(0, Math.round(progress * (cards.length - 1))));
        syncNavButtons();
      };

      // Horizontal distance still ahead of the last card, measured to the
      // gallery edge (which bleeds to the viewport) so the final card sits
      // flush with the screen edge.
      const overflow = () => {
        const last = cards[cards.length - 1];
        return Math.max(0, Math.round(last.offsetLeft + last.offsetWidth - gallery.clientWidth));
      };

      const step = (direction: number) => {
        const index = Math.min(cards.length - 1, Math.max(0, activeIndex + direction));
        gallery.scrollTo({ left: cards[index].offsetLeft, behavior: canAnimate ? 'smooth' : 'auto' });
      };

      const onNativeScroll = () => {
        const max = gallery.scrollWidth - gallery.clientWidth;
        const progress = max > 0 ? gallery.scrollLeft / max : 1;
        if (fill) {
          gsap.set(fill, { scaleX: progress });
        }
        gallery.style.setProperty(edgeProperty, String(edgeAlpha(max - gallery.scrollLeft)));
        syncProgress(progress);
      };
      const onPrev = () => step(-1);
      const onNext = () => step(1);

      // Native swipe progress (mobile, reduced motion, and pre-hydration).
      gallery.addEventListener('scroll', onNativeScroll, { passive: true });
      prevButton?.addEventListener('click', onPrev);
      nextButton?.addEventListener('click', onNext);
      onNativeScroll();

      let detachScroll: (() => void) | undefined;
      let refreshGallery = onNativeScroll;

      if (canAnimate) {
        // Desktop only: the full-viewport stage turns sticky at the viewport
        // top, and vertical scrolling scrubs the track sideways. The headroom
        // equals the actual overflow, so the section never grows beyond what
        // it shows.
        if (isDesktop && overflow() > 0) {
          section.classList.add('realizations-is-pinned');

          // Symmetric holds around the scrub: the composition rests pinned
          // before the strip starts moving and after the last card settles.
          const TAIL_RATIO = 0.3;
          const TAIL_MIN = 96;
          const hold = () => Math.max(TAIL_MIN, Math.round(overflow() * TAIL_RATIO));
          // Scrub range plus the trailing hold.
          const scrollRange = () => overflow() + hold();
          // Everything including the leading hold (used for the wrapper
          // height, so the sticky range covers the head hold too).
          const totalRange = () => scrollRange() + hold();

          // Sticky slides only within the wrapper's content box, so the
          // headroom must be height, not padding.
          const applyHeadroom = () => {
            const target = `${stage.offsetHeight + totalRange()}px`;
            if (wrap.style.height !== target) {
              wrap.style.height = target;
            }
          };
          applyHeadroom();

          const scrubEase = { duration: 0.28, ease: 'power2.out' };
          const trackTo = gsap.quickTo(track, 'x', scrubEase);
          const fillTo = fill ? gsap.quickTo(fill, 'scaleX', scrubEase) : undefined;
          const edgeTo = gsap.quickTo(gallery, edgeProperty, scrubEase);

          // Cards hop while the strip travels: each one starts offset to the
          // right and slightly low, then lifts and settles into place as it
          // crosses into the window. The "out of the dark" look is owned by
          // the gallery's edge mask — cards simply brighten while they
          // travel leftward underneath it.
          const HOP_X = 40;
          const HOP_Y = 12;
          const smooth = (value: number) => value * value * (3 - 2 * value);

          const cardTweens = cards.map((card) => ({
            x: gsap.quickTo(card, 'x', scrubEase),
            y: gsap.quickTo(card, 'y', scrubEase),
          }));

          const updateCardEntries = (targetX: number) => {
            const windowWidth = gallery.clientWidth;
            cards.forEach((card, i) => {
              const settleLine = windowWidth - card.offsetWidth;
              const span = windowWidth - settleLine;
              if (span <= 0) {
                return;
              }
              const t = smooth(Math.min(1, Math.max(0, 1 - (card.offsetLeft + targetX - settleLine) / span)));
              cardTweens[i].x((1 - t) * HOP_X);
              cardTweens[i].y((1 - t) * HOP_Y);
            });
          };

          const onScroll = () => {
            const distance = overflow();
            if (distance <= 0) {
              edgeTo(1);
              return;
            }
            // Progress 0 while the leading hold rests (stage pinned, strip
            // not moving yet), then the scrub, then the trailing hold.
            const progress = Math.min(
              1,
              Math.max(0, (-wrap.getBoundingClientRect().top - hold()) / scrollRange())
            );
            // The strip, rail and hop finish at the last card; the remaining
            // range is a hold with everything settled.
            const effective = Math.min(distance, progress * scrollRange());
            const settled = effective / distance;
            trackTo(-effective);
            fillTo?.(settled);
            edgeTo(edgeAlpha(distance - effective));
            updateCardEntries(-effective);
            syncProgress(settled);
          };

          view.addEventListener('scroll', onScroll, { passive: true });
          detachScroll = () => view.removeEventListener('scroll', onScroll);

          refreshGallery = () => {
            applyHeadroom();
            onScroll();
          };

          onScroll();
        } else {
          // Native gallery (mobile swipe or everything fits): one restrained
          // entrance instead of the scroll-driven hop.
          gsap.from(cards, {
            autoAlpha: 0,
            y: 24,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gallery,
              start: 'top 80%',
              once: true,
            },
          });
        }
      }

      // Keep the edge correct when cards, fonts, or the viewport change size,
      // including native swipe and reduced-motion layouts.
      const observer = new ResizeObserver(() => refreshGallery());
      observer.observe(gallery);
      observer.observe(track);
      observer.observe(stage);

      return () => {
        detachScroll?.();
        observer.disconnect();
        gallery.removeEventListener('scroll', onNativeScroll);
        prevButton?.removeEventListener('click', onPrev);
        nextButton?.removeEventListener('click', onNext);
        section.classList.remove('realizations-is-pinned');
        wrap.style.height = '';
        // quickTo tweens are created lazily outside this context — kill them.
        gsap.killTweensOf([track, fill, ...cards].filter(Boolean) as HTMLElement[]);
        gsap.killTweensOf(gallery, edgeProperty);
        if (originalEdgeAlpha) {
          gallery.style.setProperty(edgeProperty, originalEdgeAlpha, originalEdgePriority);
        } else {
          gallery.style.removeProperty(edgeProperty);
        }
        gsap.set(track, { clearProps: 'x' });
        if (fill) {
          gsap.set(fill, { clearProps: 'scaleX' });
        }
        gsap.set(cards, { clearProps: 'x,y' });
      };
    },
    root
  );

  return motion;
}
