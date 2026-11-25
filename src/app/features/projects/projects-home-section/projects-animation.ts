import { gsap } from 'gsap';
import { animateProjectDrawers, PROJECT_INTERACTION_EVENT } from './projects-hover-animation';
import { animateProjectRows } from './projects-row-animation';

const HOVER_QUERY =
  '(prefers-reduced-motion: no-preference) and (min-width: 48rem) and (hover: hover) and (pointer: fine)';
const ENTER_RATIO = 0.18;
const EXIT_RATIO = 0.08;

interface Reveal {
  target: HTMLElement;
  surface: HTMLElement;
  tilt: number;
  visible: boolean;
  entry?: IntersectionObserverEntry;
  animation?: gsap.core.Timeline;
}

export function animateProjects(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  if (!view) {
    return motion;
  }

  try {
    motion.add('(min-width: 48rem) and (prefers-reduced-motion: no-preference)', (context) => {
      if (!view.IntersectionObserver) {
        return;
      }

      const reveals: Reveal[] = Array.from(root.querySelectorAll<HTMLElement>('.projects-home-slot'))
        .flatMap((target, index) => {
          const surface = target.querySelector<HTMLElement>('.projects-home-motion');
          return surface ? [{
            target, surface, tilt: index % 2 === 0 ? -2.2 : 2.2, visible: false,
          }] : [];
        });
      const byTarget = new Map(reveals.map((reveal) => [reveal.target, reveal]));
      let disposed = false;

      for (const reveal of reveals) {
        // Keep links focusable before observation; only the visual layer moves.
        gsap.set(reveal.surface, {
          opacity: 0, y: 30, scale: 0.96, rotation: reveal.tilt,
        });
      }

      const pinned = (reveal: Reveal) =>
        reveal.target.contains(root.ownerDocument.activeElement) ||
        !!reveal.target.querySelector('[data-project-expanded="true"]');

      const enter = (reveal: Reveal, delay = 0, immediate = false) => {
        if (reveal.visible && !immediate) {
          return;
        }
        reveal.visible = true;
        reveal.animation?.kill();
        context.add(() => {
          const timeline = gsap.timeline({ delay });
          reveal.animation = timeline;
          if (immediate) {
            timeline.to(reveal.surface, {
              opacity: 1, y: 0, scale: 1, rotation: 0,
              duration: 0,
              clearProps: 'transform,opacity',
            });
          } else {
            timeline
              .to(reveal.surface, { opacity: 1, duration: 0.25 }, 0)
              .to(reveal.surface, {
                y: 0, scale: 1, duration: 0.65, ease: 'back.out(1.35)',
              }, 0)
              .to(reveal.surface, {
                rotation: -reveal.tilt * 0.4, duration: 0.32, ease: 'power2.out',
              }, 0)
              .to(reveal.surface, {
                rotation: reveal.tilt * 0.14, duration: 0.2, ease: 'sine.inOut',
              }, 0.32)
              .to(reveal.surface, {
                rotation: 0, duration: 0.22, ease: 'sine.out',
                clearProps: 'transform,opacity',
              }, 0.52);
          }
          if (immediate) {
            timeline.progress(1);
          }
        });
      };

      const exit = (reveal: Reveal) => {
        if (!reveal.visible || pinned(reveal)) {
          return;
        }
        reveal.visible = false;
        reveal.animation?.kill();
        context.add(() => {
          reveal.animation = gsap.timeline().to(reveal.surface, {
            opacity: 0, y: (reveal.entry?.boundingClientRect.top ?? 0) < 0 ? -18 : 24,
            scale: 0.97, rotation: reveal.tilt * 0.7,
            duration: 0.3, ease: 'power2.in',
          });
        });
      };

      const observer = new view.IntersectionObserver((entries) => {
        if (disposed) {
          return;
        }
        let stagger = 0;
        for (const entry of entries) {
          const reveal = byTarget.get(entry.target as HTMLElement);
          if (!reveal) {
            continue;
          }
          reveal.entry = entry;
          if (pinned(reveal)) {
            if (!reveal.visible) {
              enter(reveal, 0, true);
            }
          } else if (entry.isIntersecting && entry.intersectionRatio >= ENTER_RATIO) {
            if (!reveal.visible) {
              enter(reveal, Math.min(stagger++, 3) * 0.08);
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio <= EXIT_RATIO) {
            exit(reveal);
          }
        }
      }, { threshold: [0, EXIT_RATIO, ENTER_RATIO] });

      reveals.forEach((reveal) => observer.observe(reveal.target));

      const onFocus = () => {
        const reveal = reveals.find((candidate) =>
          candidate.target.contains(root.ownerDocument.activeElement),
        );
        if (reveal) {
          enter(reveal, 0, true);
        }
      };
      const onInteraction = (event: Event) => {
        const reveal = reveals.find((candidate) => candidate.target.contains(event.target as Node));
        if (!reveal) {
          return;
        }
        if (pinned(reveal)) {
          if (!reveal.visible) {
            enter(reveal, 0, true);
          }
        } else if (reveal.entry && (
          !reveal.entry.isIntersecting || reveal.entry.intersectionRatio <= EXIT_RATIO
        )) {
          exit(reveal);
        }
      };
      const onFocusOut = () => {
        view.queueMicrotask(() => {
          if (!disposed) {
            for (const reveal of reveals) {
              if (reveal.entry && (
                !reveal.entry.isIntersecting || reveal.entry.intersectionRatio <= EXIT_RATIO
              )) {
                exit(reveal);
              }
            }
          }
        });
      };
      root.addEventListener('focusin', onFocus);
      root.addEventListener('focusout', onFocusOut);
      root.addEventListener(PROJECT_INTERACTION_EVENT, onInteraction);
      onFocus();

      return () => {
        disposed = true;
        observer.disconnect();
        root.removeEventListener('focusin', onFocus);
        root.removeEventListener('focusout', onFocusOut);
        root.removeEventListener(PROJECT_INTERACTION_EVENT, onInteraction);
      };
    }, root);

    motion.add({
      canHover: HOVER_QUERY,
      wide: '(min-width: 64rem)',
    }, (context) => {
      if (!context.conditions?.['canHover']) {
        return;
      }
      return context.conditions['wide']
        ? animateProjectRows(root, context)
        : animateProjectDrawers(root, context);
    }, root);
  } catch (error) {
    motion.revert();
    throw error;
  }

  return motion;
}
