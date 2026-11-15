import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const READING_HOLD = 1;
const TRANSITION_DURATION = 0.24;
const SERVICE_STEP = READING_HOLD + TRANSITION_DURATION;

export function animateAboutMeScroll(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const section = root.querySelector<HTMLElement>('.about-section');
  const stage = root.querySelector<HTMLElement>('.about-stage');
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

  motion.add({
    isDesktop: '(min-width: 64rem)',
    canAnimate: '(prefers-reduced-motion: no-preference)',
  }, (context) => {
    if (!context.conditions?.['canAnimate']) {
      return;
    }

    const isDesktop = context.conditions['isDesktop'];
    section.classList.add('about-is-pinned');

    gsap.set(panels, { autoAlpha: 0, y: 14 });
    gsap.set(panels[0], { autoAlpha: 1, y: 0 });
    gsap.set(fill, {
      scaleX: isDesktop ? 1 : 1 / panels.length,
      scaleY: isDesktop ? 1 / panels.length : 1,
      transformOrigin: 'left top',
    });

    let activeIndex = -1;
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
          .set(panels[i - 1], { autoAlpha: 0, immediateRender: false }, switchAt)
          .set(panel, { autoAlpha: 1, immediateRender: false }, switchAt)
          .fromTo(panel, { y: 14 }, {
            y: 0, duration: TRANSITION_DURATION / 2, immediateRender: false,
          }, switchAt)
          .to(fill, {
            scaleX: isDesktop ? 1 : coverage,
            scaleY: isDesktop ? coverage : 1,
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

    const trigger = ScrollTrigger.create({
      trigger: stage,
      animation: timeline,
      start: 'top 96px',
      // Each hold gets one viewport of scrolling, with extra distance for
      // transitions. Preserve the existing stage sizing and navigation clearance.
      end: () => `+=${Math.round(timeline.duration() * (stage.offsetHeight + 96))}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
    });

    const listeners = links.map((link, i) => {
      const onClick = (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        // Seek into the selected service's settled hold, not its transition.
        const time = timeline.labels[`service-${i}`] + READING_HOLD * 0.35;
        view.scrollTo({
          top: trigger.start + time / timeline.duration() * (trigger.end - trigger.start),
          behavior: 'smooth',
        });
      };
      link.addEventListener('click', onClick);
      return () => link.removeEventListener('click', onClick);
    });

    // Account for deferred rendering and translated/font-dependent dimensions.
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(panelsContainer);
    if (header) {
      observer.observe(header);
    }
    ScrollTrigger.refresh();

    return () => {
      observer.disconnect();
      listeners.forEach((remove) => remove());
      section.classList.remove('about-is-pinned');
      panels.forEach((panel) => {
        panel.removeAttribute('inert');
        panel.removeAttribute('aria-hidden');
      });
      links.forEach((link) => link.removeAttribute('aria-current'));
    };
  }, root);

  return motion;
}
