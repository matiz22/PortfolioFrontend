import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { watchPinFit } from '../../../shared/animations/pin-fit';
import { ABOUT_PIN_REFRESH_PRIORITY } from '../../../shared/animations/home-pin-refresh-priority';

gsap.registerPlugin(ScrollTrigger);

const READING_HOLD = 1;
const TRANSITION_DURATION = 0.24;
const SERVICE_STEP = READING_HOLD + TRANSITION_DURATION;
const SCROLL_DISTANCE_SCALE = 0.65;

export function animateAboutMeScroll(root: HTMLElement, resolveInitialFragment = true): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const section = root.querySelector<HTMLElement>('.about-section');
  const stage = root.querySelector<HTMLElement>('.about-shell');
  const panelsContainer = root.querySelector<HTMLElement>('.about-panels');
  const header = root.querySelector<HTMLElement>('.about-header');
  const fill = root.querySelector<HTMLElement>('.about-fill');
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.about-panel'));
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.about-index-link'));
  const view = root.ownerDocument.defaultView;

  if (!section || !stage || !panelsContainer || !fill || !view ||
    panels.length < 2 || panels.length !== links.length) {
    return motion;
  }

  const fragmentIndex = () => panels.findIndex((panel) => `#${panel.id}` === view.location.hash);
  let initialRender = resolveInitialFragment;
  motion.add({
    isDesktop: '(min-width: 64rem) and (min-height: 48rem)',
    canAnimate: '(prefers-reduced-motion: no-preference)',
  }, (context) => {
    if (!context.conditions?.['canAnimate'] || !context.conditions['isDesktop']) {
      return;
    }

    // The fit lifecycle owns each activation. Keep its child context out of the
    // matchMedia context so nested tweens are not reverted twice on teardown.
    let stopPin!: () => void;
    context.ignore(() => {
      stopPin = watchPinFit({
      section, stage, pinnedClass: 'about-is-pinned', tolerance: 12,
      observe: [panelsContainer, ...panels, ...(header ? [header] : [])],
      mount: () => {
        let trigger!: ScrollTrigger;
        const animation = gsap.context(() => {
          gsap.set(panels, { autoAlpha: 0, y: 14 });
          gsap.set(panels[0], { autoAlpha: 1, y: 0 });
          gsap.set(fill, {
            scaleX: 1,
            scaleY: 1 / panels.length,
            transformOrigin: 'left top',
          });

          let activeIndex = -1;
          let pendingFocus: number | undefined;
          const focusSelection = () => {
            if (pendingFocus === activeIndex) {
              panels[activeIndex].focus({ preventScroll: true });
              pendingFocus = undefined;
            }
          };
          const setActive = (index: number) => {
            if (index === activeIndex) {
              return;
            }
            activeIndex = index;
            panels.forEach((panel, i) => {
              panel.inert = i !== index;
              panel.setAttribute('aria-hidden', String(i !== index));
              if (i === index) {
                links[i].setAttribute('aria-current', 'step');
              } else {
                links[i].removeAttribute('aria-current');
              }
            });
            focusSelection();
          };

          setActive(0);

          const timeline = gsap.timeline({ defaults: { ease: 'none' } });
          panels.forEach((panel, i) => {
            const holdStart = i * SERVICE_STEP;
            timeline.addLabel(`service-${i}`, holdStart);
            if (i > 0) {
              const transitionStart = holdStart - TRANSITION_DURATION;
              const switchAt = holdStart - TRANSITION_DURATION / 2;
              const coverage = (i + 1) / panels.length;
              timeline
                // Swap opacity in the same render rather than crossfading copy.
                // There is always exactly one fully readable service, even when
                // scrolling stops at the boundary or reverses across it.
                .fromTo(panels[i - 1], { '--about-text-offset': '0px' }, {
                  '--about-text-offset': '-6px', duration: TRANSITION_DURATION / 2, immediateRender: false,
                }, transitionStart)
                .set(panels[i - 1], { autoAlpha: 0, immediateRender: false }, switchAt)
                .set(panel, { autoAlpha: 1, immediateRender: false }, switchAt)
                .fromTo(panel, { y: 14, '--about-text-offset': '6px' }, {
                  y: 0, '--about-text-offset': '0px', duration: TRANSITION_DURATION / 2, immediateRender: false,
                }, switchAt)
                .to(fill, {
                  scaleX: 1,
                  scaleY: coverage,
                  duration: TRANSITION_DURATION,
                }, transitionStart);
            }
          });

          // Gaps before transitions hold each fully visible service in place.
          // Extend the final service by the same reading time before releasing the pin.
          timeline.to({}, { duration: READING_HOLD }, (panels.length - 1) * SERVICE_STEP);
          timeline.eventCallback('onUpdate', () => {
            setActive(Math.min(
              panels.length - 1,
              Math.floor((timeline.time() + TRANSITION_DURATION / 2) / SERVICE_STEP),
            ));
          });

          trigger = ScrollTrigger.create({
            trigger: stage,
            animation: timeline,
            start: 'top top',
            // Keep each service readable without requiring a full viewport of travel per hold.
            end: () => `+=${Math.round(timeline.duration() * stage.offsetHeight * SCROLL_DISTANCE_SCALE)}`,
            pin: true,
            refreshPriority: ABOUT_PIN_REFRESH_PRIORITY,
            scrub: true,
            invalidateOnRefresh: true,
          });

          const scrollToPanel = (index: number, behavior: ScrollBehavior) => {
            // The panels share a grid cell while pinned; only the timeline distinguishes them.
            const time = timeline.labels[`service-${index}`] + READING_HOLD * 0.35;
            pendingFocus = index;
            view.scrollTo({
              top: trigger.start + time / timeline.duration() * (trigger.end - trigger.start),
              behavior,
            });
            if (behavior === 'instant') {
              ScrollTrigger.update();
              timeline.time(time);
            }
            focusSelection();
          };
          const isPlainClick = (event: MouseEvent) => !event.defaultPrevented &&
            event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
          const listeners = links.map((link, i) => {
            const onClick = (event: MouseEvent) => {
              if (isPlainClick(event)) {
                event.preventDefault();
                const fragment = links[i].getAttribute('href');
                if (fragment && fragment !== view.location.hash) {
                  view.history.pushState(view.history.state, '', fragment);
                }
                scrollToPanel(i, 'smooth');
              }
            };
            link.addEventListener('click', onClick);
            return () => link.removeEventListener('click', onClick);
          });
          const onFragment = () => {
            const index = fragmentIndex();
            if (index !== -1) {
              scrollToPanel(index, 'instant');
            }
          };
          const onFragmentClick = (event: MouseEvent) => {
            const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
            // Clicking the current fragment again doesn't fire hashchange.
            if (isPlainClick(event) && link?.getAttribute('href') === view.location.hash && fragmentIndex() !== -1) {
              event.preventDefault();
              onFragment();
            }
          };
          view.addEventListener('hashchange', onFragment);
          view.document.addEventListener('click', onFragmentClick);

          ScrollTrigger.refresh();
          if (initialRender) {
            onFragment();
          }

          return () => {
            listeners.forEach((remove) => remove());
            view.removeEventListener('hashchange', onFragment);
            view.document.removeEventListener('click', onFragmentClick);
            section.classList.remove('about-is-pinned');
            panels.forEach((panel) => {
              panel.removeAttribute('inert');
              panel.removeAttribute('aria-hidden');
            });
            links.forEach((link) => link.removeAttribute('aria-current'));
          };
        }, root);
        // Refresh only this section's trigger: a global refresh would revert and
        // reapply every pin on the page, churning each spacer on every blip.
        return { refresh: () => trigger.refresh(), revert: () => animation.revert() };
      },
      });
    });
    return stopPin;
  }, root);
  initialRender = false;
  if (resolveInitialFragment && !section.classList.contains('about-is-pinned')) {
    // On a client render the native fragment may have been set before the deferred panel existed.
    const panel = panels[fragmentIndex()];
    panel?.scrollIntoView({ behavior: 'instant' });
    panel?.focus({ preventScroll: true });
  }

  return motion;
}
