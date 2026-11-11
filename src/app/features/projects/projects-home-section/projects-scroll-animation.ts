import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const INITIAL_CARD_OPACITY = 0.3;
const INITIAL_CARD_PEEK = 0.5;

interface ProjectFlight {
  path: gsap.Point2D[];
  tilt: number;
  scale: number;
}

// Stateless, project-keyed variation: refreshes regenerate geometry without
// changing a project's initial scatter. Timing is shared by every project.
function variation(key: string, salt: number): number {
  let value = 2166136261;
  for (const character of `${key}:${salt}`) {
    value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  }
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function measureFlights(
  stage: HTMLElement,
  viewport: HTMLElement,
  grid: HTMLElement,
  slots: HTMLElement[],
  cameraY: number,
  wide: boolean,
): ProjectFlight[] {
  const stageBounds = stage.getBoundingClientRect();
  const windowBounds = viewport.getBoundingClientRect();
  const windowLeft = windowBounds.left - stageBounds.left;
  const windowTop = windowBounds.top - stageBounds.top;
  const gridLeft = windowLeft + grid.offsetLeft;
  const gridTop = windowTop + grid.offsetTop + cameraY;
  const availableHeight = Math.max(0, viewport.clientHeight - grid.offsetTop * 2);

  return slots.map((slot, index) => {
    const key = slot.dataset['projectId'] || slot.textContent?.trim() || `project-${index}`;
    const random = (salt: number) => variation(key, salt);
    const width = slot.offsetWidth;
    const height = slot.offsetHeight;
    const centreX = gridLeft + slot.offsetLeft + width / 2;
    const centreY = gridTop + slot.offsetTop + height / 2;
    const direction = random(1) < 0.5 ? -1 : 1;
    const wing = Math.min(width * (wide ? 0.2 : 0.12), wide ? 110 : 38);
    const topRoom = Math.max(0, cameraY + slot.offsetTop);
    const bottomRoom = Math.max(0, availableHeight - cameraY - slot.offsetTop - height);
    const bendUp = topRoom > 24 && (bottomRoom < 24 || random(2) < 0.5);
    const bend = (bendUp ? -1 : 1)
      * Math.min(128, height * 0.8, (bendUp ? topRoom : bottomRoom) * 0.8)
      * (0.7 + random(2) * 0.3);

    // Measure the scaled, rotated footprint, not the untransformed grid cell.
    // Leave half of each card inside the actual clipping window's chosen edge.
    const tilt = direction * (wide ? 7 + random(5) * 10 : 3 + random(5) * 5);
    const scale = wide ? 0.55 + random(6) * 0.22 : 0.66 + random(6) * 0.16;
    const radians = tilt * Math.PI / 180;
    const cosine = Math.abs(Math.cos(radians));
    const sine = Math.abs(Math.sin(radians));
    const halfWidth = (width * cosine + height * sine) * scale / 2;
    const halfHeight = (width * sine + height * cosine) * scale / 2;
    const peekX = halfWidth * 2 * INITIAL_CARD_PEEK;
    const peekY = halfHeight * 2 * INITIAL_CARD_PEEK;
    const edge = Math.floor(random(0) * 3);
    const sourceX = edge === 0 ? windowLeft - halfWidth + peekX
      : edge === 1 ? windowLeft + viewport.clientWidth + halfWidth - peekX
        : windowLeft + viewport.clientWidth / 2
          + (random(3) - 0.5) * Math.max(0, viewport.clientWidth - halfWidth * 2);
    const sourceY = edge === 2 ? windowTop + viewport.clientHeight + halfHeight - peekY
      : windowTop + viewport.clientHeight / 2
        + (random(4) - 0.5) * Math.max(0, viewport.clientHeight - halfHeight * 2);
    const launch = { x: sourceX - centreX, y: sourceY - centreY };

    const safeEdge = width * 0.43 + Math.min(height * 0.025, 10);
    const clampX = gsap.utils.clamp(
      Math.min(0, safeEdge - centreX),
      Math.max(0, stage.clientWidth - safeEdge - centreX),
    );
    const apex = { x: clampX(direction * wing), y: bend };
    const shoulder = { x: clampX(-direction * wing * 0.45), y: bend * 0.18 };

    return {
      path: [
        launch,
        { x: launch.x * 0.6 + apex.x * 0.4, y: launch.y * 0.45 + bend * 0.3 },
        { x: clampX(apex.x + direction * wing * 0.35), y: bend * 1.15 },
        apex,
        { x: apex.x, y: bend * 0.6 },
        { x: shoulder.x, y: bend * 0.44 },
        shoulder,
        { x: shoulder.x, y: bend * 0.08 },
        { x: 0, y: bend * 0.08 },
        { x: 0, y: 0 },
      ],
      tilt,
      scale,
    };
  });
}

export function animateProjectsScroll(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const view = root.ownerDocument.defaultView;
  const section = root.querySelector<HTMLElement>('.projects-home-section');
  const wrap = root.querySelector<HTMLElement>('.projects-home-scroll');
  const stage = root.querySelector<HTMLElement>('.projects-home-stage');
  const header = root.querySelector<HTMLElement>('.projects-home-header');
  const viewport = root.querySelector<HTMLElement>('.projects-home-viewport');
  const grid = root.querySelector<HTMLElement>('.projects-home-grid');
  const fill = root.querySelector<HTMLElement>('.projects-home-progress-fill');
  const slots = Array.from(root.querySelectorAll<HTMLElement>('.projects-home-slot'));

  if (!view || !section || !wrap || !stage || !viewport || !grid) {
    return motion;
  }

  const initialHeight = wrap.style.height;

  try {
    // Keep the one-time heading reveal independent of responsive grid rebuilds.
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      if (!header) {
        return;
      }

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
            start: 'clamp(top 82%)',
            once: true,
          },
        });
      }
    }, root);

    motion.add(
      {
        canAnimate: '(prefers-reduced-motion: no-preference)',
        wide: '(min-width: 48rem)',
        tallEnough: '(min-height: 36rem)',
      },
      (context) => {
        if (!context.conditions?.['canAnimate'] || !context.conditions['tallEnough'] ||
          slots.length === 0) {
          return;
        }

        const wide = context.conditions['wide'];
        const previousHeight = wrap.style.height;
        section.classList.add('projects-home-is-assembling');

        const entries = slots.flatMap((slot) => {
          const card = slot.querySelector<HTMLElement>('.projects-home-item');
          return card ? [{ slot, card }] : [];
        });
        const flightSlots = entries.map((entry) => entry.slot);
        let flights: ProjectFlight[] = [];
        const motionPaths: MotionPath.Vars[] = [];
        let initialCameraY = 0;
        let overflow = 0;
        const scrollDistance = () => Math.round(stage.offsetHeight * 1.35 + overflow);
        const readLayout = () => {
          const availableHeight = Math.max(0, viewport.clientHeight - grid.offsetTop * 2);
          initialCameraY = Math.max(0, (availableHeight - grid.offsetHeight) / 2);
          overflow = Math.max(0, grid.offsetHeight - availableHeight);
          flights = measureFlights(stage, viewport, grid, flightSlots, initialCameraY, wide);
          flights.forEach((flight, index) => {
            if (motionPaths[index]) {
              motionPaths[index].path = flight.path;
            } else {
              motionPaths.push({
                path: flight.path,
                type: 'cubic',
                fromCurrent: false,
                autoRotate: false,
              });
            }
          });

          const height = `${stage.offsetHeight + scrollDistance()}px`;
          if (wrap.style.height !== height) {
            wrap.style.height = height;
          }
        };

        // Don't crop unusually tall content or trap it in a landscape viewport.
        const availableHeight = viewport.clientHeight - grid.offsetTop * 2;
        if (entries.length === 0 || slots.some((slot) => slot.offsetHeight + 24 > availableHeight)) {
          section.classList.remove('projects-home-is-assembling');
          return;
        }

        readLayout();
        const launchAt = 0.18;
        const duration = 1;
        const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
        timeline.fromTo(grid, { y: () => initialCameraY }, {
          y: () => initialCameraY,
          duration: launchAt,
        });
        timeline.addLabel('assembly-launch', launchAt);

        // Every project shares these exact start and end times. Only the
        // initial placement, pose, and curve vary; rows never govern playback.
        for (const [index, { card }] of entries.entries()) {
          timeline
            .fromTo(card, {
              x: () => flights[index].path[0].x,
              y: () => flights[index].path[0].y,
            }, {
              motionPath: motionPaths[index],
              duration,
              ease: 'none',
            }, launchAt)
            // Scatter the starting poses; straighten only as each card docks.
            // Banking stays independent of the tangent so titles never flip.
            .fromTo(card, {
              scale: () => flights[index].scale,
              rotation: () => flights[index].tilt,
            }, {
              scale: 0.86,
              rotation: () => -flights[index].tilt * 0.25,
              duration: duration * 0.64,
              ease: 'power1.inOut',
            }, launchAt)
            .to(card, {
              scale: 1,
              rotation: 0,
              duration: duration * 0.36,
              ease: 'power2.out',
            }, launchAt + duration * 0.64)
            // Opacity (not visibility) keeps the keyboard focus-to-dock path
            // available even before a card has materialised inside the stage.
            .fromTo(card, { opacity: INITIAL_CARD_OPACITY }, {
              opacity: 1,
              duration: duration * 0.72,
              ease: 'power1.inOut',
            }, launchAt + duration * 0.04);
        }

        timeline.addLabel('assembly-docked');
        timeline.to({}, { duration: 0.18 });

        // If the finished grid is taller than the window, browse it in one
        // continuous pass after ALL cards have landed, not in row-sized steps.
        const browseDuration = Math.max(0.3, overflow / stage.offsetHeight);
        timeline.addLabel('grid-browse');
        timeline.to(grid, {
          y: () => initialCameraY - overflow,
          duration: browseDuration,
        });
        timeline.addLabel('assembly-complete');
        timeline.to({}, { duration: 0.35 });
        if (fill) {
          timeline.fromTo(fill, { scaleX: 0 }, {
            scaleX: 1,
            duration: timeline.duration(),
          }, 0);
        }

        const trigger = ScrollTrigger.create({
          // CSS owns the sticky stage. The whole scatter-to-grid animation
          // has one stable trigger, with no row or column sub-timelines.
          trigger: wrap,
          animation: timeline,
          start: 'top top',
          end: () => `+=${scrollDistance()}`,
          scrub: 0.45,
          invalidateOnRefresh: true,
          onRefreshInit: readLayout,
          onRefresh: (self) => {
            self.getTween()?.progress(1);
            timeline.progress(self.progress);
          },
        });

        const removeFocusListeners = entries.map(({ slot }) => {
          const onFocus = () => {
            const dockedTime = timeline.labels['assembly-docked'];
            const bounds = slot.getBoundingClientRect();
            const windowBounds = viewport.getBoundingClientRect();
            if (timeline.time() >= dockedTime && bounds.top >= windowBounds.top &&
              bounds.bottom <= windowBounds.bottom) {
              return;
            }

            // Keyboard navigation docks the entire composition at once, then
            // seeks within the continuous read-through to expose this project.
            const availableHeight = viewport.clientHeight - grid.offsetTop * 2;
            const cameraY = gsap.utils.clamp(initialCameraY - overflow, initialCameraY,
              (availableHeight - slot.offsetHeight) / 2 - slot.offsetTop);
            const time = overflow > 0
              ? timeline.labels['grid-browse'] + (initialCameraY - cameraY) / overflow * browseDuration
              : dockedTime;
            const progress = time / timeline.duration();
            view.scrollTo({
              top: trigger.start + progress * (trigger.end - trigger.start),
              behavior: 'instant',
            });
            trigger.update();
            trigger.getTween()?.progress(1);
            timeline.time(time);
          };
          slot.addEventListener('focusin', onFocus);
          return () => slot.removeEventListener('focusin', onFocus);
        });

        // Restore keyboard access after matchMedia rebuilds the composition.
        const active = root.ownerDocument.activeElement;
        if (active) {
          const slot = slots.find((candidate) => candidate.contains(active));
          if (slot) {
            slot.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
          }
        }

        // Refresh replaces the path coordinates before invalidating the tweens,
        // so resizing regenerates routes as well as trigger positions.
        let refreshFrame: number | undefined;
        const resizeObserver = new ResizeObserver(() => {
          if (refreshFrame !== undefined) {
            return;
          }
          refreshFrame = view.requestAnimationFrame(() => {
            refreshFrame = undefined;
            ScrollTrigger.refresh();
          });
        });
        resizeObserver.observe(grid);
        resizeObserver.observe(stage);
        resizeObserver.observe(viewport);
        if (header) {
          resizeObserver.observe(header);
        }

        return () => {
          resizeObserver.disconnect();
          if (refreshFrame !== undefined) {
            view.cancelAnimationFrame(refreshFrame);
          }
          removeFocusListeners.forEach((remove) => remove());
          section.classList.remove('projects-home-is-assembling');
          wrap.style.height = previousHeight;
        };
      },
      root,
    );

    // Initialize at the current scroll position, including restored/deep links.
    ScrollTrigger.refresh();
  } catch (error) {
    // A failed enhancement must not leave partially initialized, faded content.
    motion.revert();
    section.classList.remove('projects-home-is-assembling');
    wrap.style.height = initialHeight;
    throw error;
  }

  return motion;
}
