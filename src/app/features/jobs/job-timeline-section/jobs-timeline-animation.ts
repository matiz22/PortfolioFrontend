import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HORIZONTAL_QUERY = '(min-width: 64rem) and (min-height: 48rem)';
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';
const NAV_CLEARANCE = 80;
const SCROLL_DISTANCE_MULTIPLIER = 1.85;
const MIN_SCROLL_VIEWPORT_RATIO = 0.6;
const INITIAL_HOLD_RATIO = 0.14;

export function animateJobsTimeline(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  const section = root.querySelector<HTMLElement>('.jobs-section');
  const stage = root.querySelector<HTMLElement>('.jobs-stage');
  const viewport = root.querySelector<HTMLElement>('.jobs-viewport');
  const track = root.querySelector<HTMLElement>('.jobs-track');
  const rail = root.querySelector<HTMLElement>('.jobs-rail');
  const fill = root.querySelector<HTMLElement>('.jobs-rail-fill');
  const entries = Array.from(root.querySelectorAll<HTMLElement>('.jobs-entry'));

  if (!view || !section || !stage || !viewport || !track || !rail || !fill || !entries.length) {
    return motion;
  }

  try {
    motion.add({
      wide: HORIZONTAL_QUERY,
      canAnimate: MOTION_QUERY,
    }, (context) => {
      if (!context.conditions?.['canAnimate']) {
        return;
      }

      let horizontal = context.conditions['wide'] && entries.length > 1;
      let scroll: ScrollTrigger | undefined;
      let observer: ResizeObserver | undefined;
      let refreshFrame = 0;
      let activeIndex = -1;
      let reachedIndex = -1;

      const overflow = () => {
        const style = view.getComputedStyle(viewport);
        const inset = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        return Math.max(0, track.scrollWidth - viewport.clientWidth + inset);
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

      if (horizontal) {
        stage.classList.add('jobs-horizontal');
        // Reserve room for bottom navigation before checking the font-loaded height.
        stage.classList.toggle('jobs-scrollable', overflow() > 0);
        if (stage.offsetHeight > view.innerHeight - NAV_CLEARANCE - 16) {
          horizontal = false;
          stage.classList.remove('jobs-horizontal', 'jobs-scrollable');
        }
      }

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out', immediateRender: true },
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      });
      // Draw the rail itself; the pinned timeline still owns the colored fill.
      intro.from(rail, { [horizontal ? 'scaleX' : 'scaleY']: 0, duration: 0.9 }, 0.2);
      if (horizontal) {
        // Leave card opacity to the active, hover, and focus styles.
        intro.from(entries, { opacity: 0, y: 24, duration: 0.65, stagger: 0.08 }, 0.3);
      }

      context.add(() => {
        // A keyboard user can reach the links before the entrance completes.
        const onIntroFocus = (event: FocusEvent) => {
          if (event.target instanceof view.HTMLElement && event.target.matches(':focus-visible')) {
            intro.progress(1);
          }
        };
        section.addEventListener('focusin', onIntroFocus);
        return () => section.removeEventListener('focusin', onIntroFocus);
      });

      if (horizontal && overflow() > 0) {
        // Pin the complete section, including its background, lower border,
        // and bottom controls. Only the timeline track moves within it.
        gsap.set(stage, { '--jobs-nav-clearance': `${NAV_CLEARANCE}px` });
        section.classList.add('jobs-section-pinned');
        stage.classList.add('jobs-pinned');
        gsap.set(fill, { scaleX: 0 });
        const travel = gsap.timeline({
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
            // Upper deferred sections may create their pins after this one.
            // Measure this lower section after those pins add their spacing.
            refreshPriority: -1,
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
        const onFocus = (event: FocusEvent) => {
          const target = event.target;
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
          travel.progress(progress);
        };
        track.addEventListener('focusin', onFocus);

        // A single refresh per frame accommodates deferred sections and layout changes.
        const requestRefresh = () => {
          if (!refreshFrame) {
            refreshFrame = view.requestAnimationFrame(() => {
              refreshFrame = 0;
              ScrollTrigger.refresh();
            });
          }
        };
        if (view.ResizeObserver) {
          observer = new view.ResizeObserver(requestRefresh);
          observer.observe(viewport);
          observer.observe(track);
        }
        requestRefresh();

        return () => {
          observer?.disconnect();
          view.cancelAnimationFrame(refreshFrame);
          track.removeEventListener('focusin', onFocus);
          stage.classList.remove('jobs-horizontal', 'jobs-scrollable', 'jobs-pinned');
          section.classList.remove('jobs-section-pinned');
          entries.forEach((entry) => entry.classList.remove(
            'jobs-entry-active', 'jobs-entry-reached',
          ));
        };
      }

      // In the vertical layout, reveal each point together with its card.
      if (!horizontal) {
        for (const entry of entries) {
          const parts = entry.querySelectorAll<HTMLElement>('.jobs-point, .jobs-card');
          if (!parts.length) {
            continue;
          }
          gsap.from(parts, {
            opacity: 0.4,
            y: 18,
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: { trigger: entry, start: 'top 90%', once: true },
          });
        }
      }

      return () => {
        stage.classList.remove('jobs-horizontal', 'jobs-scrollable', 'jobs-pinned');
        section.classList.remove('jobs-section-pinned');
      };
    }, root);
  } catch (error) {
    motion.revert();
    stage.classList.remove('jobs-horizontal', 'jobs-scrollable', 'jobs-pinned');
    section.classList.remove('jobs-section-pinned');
    throw error;
  }

  return motion;
}
