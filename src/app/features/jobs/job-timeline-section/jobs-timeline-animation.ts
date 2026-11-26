import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createFrameTask } from '../../../shared/animations/frame-task';
import { MOTION_ALLOWED_QUERY } from '../../../shared/animations/motion-media';

gsap.registerPlugin(ScrollTrigger);

const HORIZONTAL_QUERY = '(min-width: 64rem) and (min-height: 48rem)';
const MOBILE_QUERY = '(width < 48rem)';
const SCROLL_DISTANCE_MULTIPLIER = 1.85;
const MIN_SCROLL_VIEWPORT_RATIO = 0.6;
const INITIAL_HOLD_RATIO = 0.14;

type TimelineLayout = 'vertical' | 'native' | 'pinned';

export function animateJobsTimeline(
  root: HTMLElement,
  reportPinned: (pinned: boolean) => void = () => undefined,
): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  const section = root.querySelector<HTMLElement>(':scope > .jobs-section');
  const shell = root.querySelector<HTMLElement>('.jobs-shell');
  const stage = root.querySelector<HTMLElement>('.jobs-stage');
  const viewport = root.querySelector<HTMLElement>('.jobs-viewport');
  const track = root.querySelector<HTMLElement>('.jobs-track');
  const rail = root.querySelector<HTMLElement>('.jobs-rail');
  const fill = root.querySelector<HTMLElement>('.jobs-rail-fill');
  const controls = root.querySelector<HTMLElement>('.jobs-rail-controls');
  const entries = Array.from(root.querySelectorAll<HTMLElement>('.jobs-entry'));

  if (!view || !section || !shell || !stage || !viewport || !track || !rail || !fill || !entries.length) {
    return motion;
  }

  try {
    motion.add({
      wide: HORIZONTAL_QUERY,
      mobile: MOBILE_QUERY,
      canAnimate: MOTION_ALLOWED_QUERY,
    }, (context) => {
      // The native mobile rail is entirely CSS-driven.
      if (!context.conditions?.['canAnimate'] || context.conditions['mobile']) {
        return;
      }

      let layout: TimelineLayout | undefined;
      let travel: gsap.core.Timeline | undefined;
      let travelDistance = 0;
      let draw: ReturnType<typeof createFrameTask> | undefined;
      const onScroll = () => draw?.request();
      const { height: hostHeight } = root.style;
      let intro: gsap.core.Timeline | undefined;
      let reveals: gsap.core.Animation[] = [];
      let observer: ResizeObserver | undefined;
      let entryObserver: IntersectionObserver | undefined;
      let refreshFrame = 0;
      let activeIndex = -1;
      let reachedIndex = -1;
      let disposed = false;

      const overflow = () => {
        const style = view.getComputedStyle(viewport);
        const inset = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        return Math.max(0, track.scrollWidth - viewport.clientWidth + inset);
      };
      // The section pins via CSS sticky inside the host, which the geometry
      // below stretches by the scroll travel. Scroll drives the timeline from
      // a frame task, so no style is written while a scroll event is handled.
      const applyTravel = () => {
        if (!travel || travelDistance <= 0) {
          return;
        }
        const progress = gsap.utils.clamp(
          0, travelDistance, -root.getBoundingClientRect().top,
        ) / travelDistance;
        travel.progress(progress);
      };
      const syncTravelGeometry = () => {
        if (!travel) {
          return;
        }
        travelDistance = Math.round(Math.max(
          view.innerHeight * MIN_SCROLL_VIEWPORT_RATIO,
          overflow() * SCROLL_DISTANCE_MULTIPLIER,
        ) / (1 - INITIAL_HOLD_RATIO));
        root.style.height = `${section.offsetHeight + travelDistance}px`;
        // Re-evaluate the function-based travel target from a clean start,
        // like a ScrollTrigger refresh would, then resync to live scroll.
        travel.progress(0);
        travel.invalidate();
        applyTravel();
      };
      const clearMarkers = () => {
        activeIndex = -1;
        reachedIndex = -1;
        entries.forEach((entry) => entry.classList.remove(
          'jobs-entry-active', 'jobs-entry-reached',
        ));
      };
      const highlight = (progress: number) => {
        const contentProgress = gsap.utils.clamp(
          0, 1, (progress - INITIAL_HOLD_RATIO) / (1 - INITIAL_HOLD_RATIO),
        );
        const index = Math.round(contentProgress * (entries.length - 1));
        // Nodes are evenly spaced along the rail. Unlike card emphasis, a
        // marker must wait until the fill reaches its exact position.
        const reached = Math.floor(contentProgress * (entries.length - 1) + 1e-6);
        if (index === activeIndex && reached === reachedIndex) {
          return;
        }
        activeIndex = index;
        reachedIndex = reached;
        entries.forEach((entry, position) => {
          entry.classList.toggle('jobs-entry-active', position === index);
          entry.classList.toggle('jobs-entry-reached', position <= reached);
        });
      };

      const revealInPin = (target: EventTarget | null) => {
        if (!(target instanceof view.HTMLElement) || !travel) {
          return;
        }
        const entry = target.closest<HTMLElement>('.jobs-entry');
        if (!entry || !track.contains(entry)) {
          return;
        }
        const bounds = target.getBoundingClientRect();
        const windowBounds = viewport.getBoundingClientRect();
        if (bounds.left >= windowBounds.left && bounds.right <= windowBounds.right) {
          return;
        }

        const distance = overflow();
        if (distance <= 0) {
          return;
        }
        const position = gsap.utils.clamp(
          0, distance, entry.offsetLeft - viewport.clientWidth * 0.15,
        );
        const progress = INITIAL_HOLD_RATIO +
          (position / distance) * (1 - INITIAL_HOLD_RATIO);
        view.scrollTo({
          top: root.getBoundingClientRect().top + view.scrollY + progress * travelDistance,
          behavior: 'instant',
        });
        ScrollTrigger.update();
        travel.progress(progress);
      };
      const onTravelFocus = (event: FocusEvent) => revealInPin(event.target);

      const clearTravel = () => {
        const wasPinned = !!travel;
        draw?.dispose();
        draw = undefined;
        view.removeEventListener('scroll', onScroll);
        travel?.kill();
        travel = undefined;
        travelDistance = 0;
        root.style.height = hostHeight;
        track.removeEventListener('focusin', onTravelFocus);
        gsap.set(track, { clearProps: 'transform' });
        gsap.set(fill, { clearProps: 'transform' });
        stage.classList.remove('jobs-pinned');
        section.classList.remove('jobs-section-pinned');
        clearMarkers();
        if (wasPinned) reportPinned(false);
      };

      const createTravel = () => {
        if (travel || overflow() <= 0) {
          return;
        }
        // Pin the section and its bottom controls. Only the track moves within it.
        viewport.scrollLeft = 0;
        section.classList.add('jobs-section-pinned');
        stage.classList.add('jobs-pinned');
        gsap.set(fill, { scaleX: 0 });
        // Driven manually from scroll progress; paused so it never runs on
        // its own ticker.
        travel = gsap.timeline({
          defaults: { duration: 1 - INITIAL_HOLD_RATIO, ease: 'none' },
          paused: true,
          onUpdate: function (this: gsap.core.Timeline) {
            highlight(this.progress());
          },
        })
          // The stage first settles fully into view. Only then does the
          // remaining scroll range begin moving the first role out of view.
          .to(track, { x: () => -overflow() }, INITIAL_HOLD_RATIO)
          .to(fill, { scaleX: 1 }, INITIAL_HOLD_RATIO);
        draw = createFrameTask(view, applyTravel);
        view.addEventListener('scroll', onScroll, { passive: true });
        syncTravelGeometry();
        // progress 0 renders no update, so set the initial markers directly.
        highlight(travel.progress());
        track.addEventListener('focusin', onTravelFocus);
        reportPinned(true);
      };

      const clearMotion = () => {
        intro?.scrollTrigger?.kill();
        intro?.kill();
        intro = undefined;
        for (const reveal of reveals) {
          reveal.scrollTrigger?.kill();
          reveal.kill();
        }
        reveals = [];
        gsap.set(rail, { clearProps: 'transform' });
        gsap.set(entries, { clearProps: 'opacity,transform' });
        for (const entry of entries) {
          gsap.set(entry.querySelectorAll('.jobs-point, .jobs-card'), {
            clearProps: 'opacity,transform',
          });
        }
      };

      const createIntro = (horizontal: boolean, immediate: boolean) => {
        intro = gsap.timeline({
          defaults: { ease: 'power3.out', immediateRender: true },
          scrollTrigger: { trigger: section, start: 'top 82%', once: true },
        });
        // Draw the rail itself; the pinned timeline still owns the colored fill.
        intro.from(rail, { [horizontal ? 'scaleX' : 'scaleY']: 0, duration: 0.9 }, 0.2);
        if (horizontal) {
          // Leave card opacity to the active, hover, and focus styles.
          intro.from(entries, { opacity: 0, y: 24, duration: 0.65, stagger: 0.08 }, 0.3);
        }
        if (immediate) {
          intro.progress(1);
        }
      };

      const createVerticalReveals = () => {
        // In the vertical layout, reveal each point together with its card.
        for (const entry of entries) {
          const parts = entry.querySelectorAll<HTMLElement>('.jobs-point, .jobs-card');
          if (!parts.length) {
            continue;
          }
          reveals.push(gsap.from(parts, {
            opacity: 0.4,
            y: 18,
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: { trigger: entry, start: 'top 90%', once: true },
          }));
        }
      };

      const measureLayout = (): TimelineLayout => {
        if (entries.length < 2) {
          return 'vertical';
        }
        if (!context.conditions?.['wide'] || overflow() <= 1 ||
            controls?.contains(root.ownerDocument.activeElement)) {
          return 'native';
        }

        // Include the header clearance and next-chapter link, but not arrows
        // that are only used by the native scroller.
        stage.classList.add('jobs-pin-fit');
        const fits = shell.offsetHeight <= view.innerHeight;
        stage.classList.remove('jobs-pin-fit');
        return fits ? 'pinned' : 'native';
      };

      const reconcile = (firstRender = false) => {
        if (disposed) {
          return;
        }
        refreshFrame = 0;
        const next = measureLayout();
        const changed = next !== layout;
        if (changed) {
          const orientationChanged = layout === undefined ||
            (layout === 'vertical') !== (next === 'vertical');
          const replayIntro = !firstRender && !!intro && intro.progress() > 0;
          clearTravel();
          if (orientationChanged) {
            clearMotion();
          }
          layout = next;
          const horizontal = next !== 'vertical';
          if (orientationChanged) {
            createIntro(horizontal, replayIntro);
            if (!horizontal) {
              createVerticalReveals();
            }
          }
          if (next === 'pinned') {
            createTravel();
          } else {
            gsap.set(track, { clearProps: 'transform' });
            gsap.set(fill, { clearProps: 'transform' });
            clearMarkers();
          }
        } else if (next === 'pinned') {
          // Same layout: recompute travel distance and targets from current
          // geometry, like a ScrollTrigger refresh would.
          syncTravelGeometry();
        }
        ScrollTrigger.refresh();
        if (changed) {
          const focused = root.ownerDocument.activeElement;
          if (focused instanceof view.HTMLElement && section.contains(focused)) {
            if (focused.matches(':focus-visible')) {
              intro?.progress(1);
            }
            if (travel) {
              revealInPin(focused);
            } else if (!firstRender) {
              focused.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
            }
          }
        }
      };

      const requestReconcile = () => {
        if (!refreshFrame && !disposed) {
          refreshFrame = view.requestAnimationFrame(() => reconcile());
        }
      };

      const start = () => context.add(() => {
        // A keyboard user can reach the links before the entrance completes.
        const onIntroFocus = (event: FocusEvent) => {
          if (event.target instanceof view.HTMLElement && event.target.matches(':focus-visible')) {
            intro?.progress(1);
          }
        };
        section.addEventListener('focusin', onIntroFocus);
        controls?.addEventListener('focusout', requestReconcile);

        reconcile(true);
        if (view.ResizeObserver) {
          observer = new view.ResizeObserver(requestReconcile);
          // Width and height eligibility can change independently of media queries.
          observer.observe(viewport);
          observer.observe(track);
          observer.observe(shell);
        }
        // The height threshold can change without changing any observed box.
        view.addEventListener('resize', requestReconcile);

        return () => {
          section.removeEventListener('focusin', onIntroFocus);
          controls?.removeEventListener('focusout', requestReconcile);
        };
      });

      // The lazy animation can arrive after the visitor has left Experience.
      // Keep its static height until they return rather than moving later chapters.
      if (root.getBoundingClientRect().bottom <= 1 && view.IntersectionObserver) {
        entryObserver = new view.IntersectionObserver((entries) => {
          if (disposed || !entryObserver || !entries.some(entry => entry.isIntersecting) ||
              root.getBoundingClientRect().bottom <= 1) {
            return;
          }
          entryObserver.disconnect();
          entryObserver = undefined;
          start();
        }, { rootMargin: '-1px 0px' });
        entryObserver.observe(root);
      } else {
        start();
      }

      return () => {
        disposed = true;
        if (entryObserver) {
          entryObserver.disconnect();
          return;
        }
        observer?.disconnect();
        view.removeEventListener('resize', requestReconcile);
        view.cancelAnimationFrame(refreshFrame);
        clearTravel();
        clearMotion();
        stage.classList.remove('jobs-pin-fit');
        section.classList.remove('jobs-section-pinned');
      };
    }, root);
  } catch (error) {
    motion.revert();
    stage.classList.remove('jobs-pin-fit', 'jobs-pinned');
    section.classList.remove('jobs-section-pinned');
    throw error;
  }

  return motion;
}
