import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JOBS_PIN_REFRESH_PRIORITY } from '../../../shared/animations/home-pin-refresh-priority';

gsap.registerPlugin(ScrollTrigger);

const HORIZONTAL_QUERY = '(min-width: 64rem) and (min-height: 48rem)';
const MOBILE_QUERY = '(width < 48rem)';
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';
const SCROLL_DISTANCE_MULTIPLIER = 1.85;
const MIN_SCROLL_VIEWPORT_RATIO = 0.6;
const INITIAL_HOLD_RATIO = 0.14;

type TimelineLayout = 'vertical' | 'fit' | 'pinned';

export function animateJobsTimeline(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  const section = root.querySelector<HTMLElement>(':scope > .jobs-section');
  const shell = root.querySelector<HTMLElement>('.jobs-shell');
  const stage = root.querySelector<HTMLElement>('.jobs-stage');
  const viewport = root.querySelector<HTMLElement>('.jobs-viewport');
  const track = root.querySelector<HTMLElement>('.jobs-track');
  const rail = root.querySelector<HTMLElement>('.jobs-rail');
  const fill = root.querySelector<HTMLElement>('.jobs-rail-fill');
  const entries = Array.from(root.querySelectorAll<HTMLElement>('.jobs-entry'));

  if (!view || !section || !shell || !stage || !viewport || !track || !rail || !fill || !entries.length) {
    return motion;
  }

  try {
    motion.add({
      wide: HORIZONTAL_QUERY,
      mobile: MOBILE_QUERY,
      canAnimate: MOTION_QUERY,
    }, (context) => {
      // The native mobile rail is entirely CSS-driven.
      if (!context.conditions?.['canAnimate'] || context.conditions['mobile']) {
        return;
      }

      let layout: TimelineLayout | undefined;
      let scroll: ScrollTrigger | undefined;
      let travel: gsap.core.Timeline | undefined;
      let intro: gsap.core.Timeline | undefined;
      let reveals: gsap.core.Animation[] = [];
      let observer: ResizeObserver | undefined;
      let refreshFrame = 0;
      let activeIndex = -1;
      let reachedIndex = -1;
      let disposed = false;
      const { overflow: hostOverflow, flexBasis: hostFlexBasis } = root.style;

      const overflow = () => {
        const style = view.getComputedStyle(viewport);
        const inset = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        return Math.max(0, track.scrollWidth - viewport.clientWidth + inset);
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
        if (!(target instanceof view.HTMLElement) || !scroll) {
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
          top: scroll.start + progress * (scroll.end - scroll.start),
          behavior: 'instant',
        });
        ScrollTrigger.update();
        travel?.progress(progress);
      };
      const onTravelFocus = (event: FocusEvent) => revealInPin(event.target);

      const clearTravel = () => {
        const trigger = travel?.scrollTrigger;
        trigger?.kill();
        travel?.kill();
        if (travel) {
          root.classList.remove('pin-spacer');
          root.style.overflow = hostOverflow;
          root.style.flexBasis = hostFlexBasis;
          // Unlike a generated spacer, the host survives unpinning.
          Reflect.deleteProperty(root, '_pinOffset');
        }
        scroll = undefined;
        travel = undefined;
        track.removeEventListener('focusin', onTravelFocus);
        gsap.set(track, { clearProps: 'transform' });
        gsap.set(fill, { clearProps: 'transform' });
        stage.classList.remove('jobs-pinned', 'jobs-scrollable');
        section.classList.remove('jobs-section-pinned');
        clearMarkers();
      };

      const createTravel = () => {
        if (scroll || overflow() <= 0) {
          return;
        }
        // Pin the section and its bottom controls. Only the track moves within it.
        section.classList.add('jobs-section-pinned');
        stage.classList.add('jobs-pinned');
        gsap.set(fill, { scaleX: 0 });
        travel = gsap.timeline({
          defaults: { duration: 1 - INITIAL_HOLD_RATIO, ease: 'none' },
          onUpdate: function (this: gsap.core.Timeline) {
            highlight(this.progress());
          },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            // Keep compact timelines deliberate too, without changing their
            // actual horizontal travel or adding empty space after the last role.
            end: () => `+=${Math.max(
              view.innerHeight * MIN_SCROLL_VIEWPORT_RATIO,
              overflow() * SCROLL_DISTANCE_MULTIPLIER,
            ) / (1 - INITIAL_HOLD_RATIO)}`,
            pin: true,
            // The host is already the section's parent. A generated spacer would
            // reparent the focused link on pin, refresh, and teardown.
            pinSpacer: root,
            refreshPriority: JOBS_PIN_REFRESH_PRIORITY,
            // No catch-up lag: the last role is in place before the pin releases.
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
          // The stage first settles fully into view. Only then does the
          // remaining scroll range begin moving the first role out of view.
          .to(track, { x: () => -overflow() }, INITIAL_HOLD_RATIO)
          .to(fill, { scaleX: 1 }, INITIAL_HOLD_RATIO);

        scroll = travel.scrollTrigger;
        highlight(travel.progress());
        // Transformed off-screen links remain keyboard reachable. Seeking the
        // associated vertical scroll position brings their whole role into view.
        track.addEventListener('focusin', onTravelFocus);
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
        if (!context.conditions?.['wide'] || entries.length < 2) {
          stage.classList.remove('jobs-horizontal');
          return 'vertical';
        }

        stage.classList.add('jobs-horizontal');
        // The shell includes the top clearance and its separate navigation row.
        if (shell.offsetHeight > view.innerHeight) {
          stage.classList.remove('jobs-horizontal');
          return 'vertical';
        }
        return overflow() > 0 ? 'pinned' : 'fit';
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
          stage.classList.toggle('jobs-horizontal', horizontal);
          stage.classList.toggle('jobs-scrollable', next === 'pinned');
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
        }
        ScrollTrigger.refresh();
        if (changed) {
          const focused = root.ownerDocument.activeElement;
          if (focused instanceof view.HTMLElement && section.contains(focused)) {
            if (focused.matches(':focus-visible')) {
              intro?.progress(1);
            }
            if (scroll) {
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

      context.add(() => {
        // A keyboard user can reach the links before the entrance completes.
        const onIntroFocus = (event: FocusEvent) => {
          if (event.target instanceof view.HTMLElement && event.target.matches(':focus-visible')) {
            intro?.progress(1);
          }
        };
        section.addEventListener('focusin', onIntroFocus);
        return () => section.removeEventListener('focusin', onIntroFocus);
      });

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
        disposed = true;
        observer?.disconnect();
        view.removeEventListener('resize', requestReconcile);
        view.cancelAnimationFrame(refreshFrame);
        clearTravel();
        clearMotion();
        stage.classList.remove('jobs-horizontal', 'jobs-scrollable', 'jobs-pinned');
        section.classList.remove('jobs-section-pinned');
      };
    }, root);
  } catch (error) {
    motion.revert();
    root.classList.remove('pin-spacer');
    stage.classList.remove('jobs-horizontal', 'jobs-scrollable', 'jobs-pinned');
    section.classList.remove('jobs-section-pinned');
    throw error;
  }

  return motion;
}
