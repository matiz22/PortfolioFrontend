import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
      timeline.addLabel(`service-${i}`, i);
      if (i > 0) {
        timeline
          .to(panels[i - 1], { autoAlpha: 0, y: -14, duration: 0.16 }, i - 0.16)
          .to(panel, { autoAlpha: 1, y: 0, duration: 0.16 }, i);
      }
    });

    // Equal reading time for each service, including a hold before unpinning.
    timeline.to(fill, { scaleX: 1, scaleY: 1, duration: panels.length }, 0);
    timeline.eventCallback('onUpdate', () => {
      setActive(Math.min(panels.length - 1, Math.floor(timeline.time())));
    });

    const trigger = ScrollTrigger.create({
      trigger: stage,
      animation: timeline,
      start: 'top 96px',
      // The stage uses svh, so a mobile browser's address bar does not change the scroll distance.
      end: () => `+=${Math.round(panels.length * (stage.offsetHeight + 96) * 0.75)}`,
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
    });

    const listeners = links.map((link, i) => {
      const onClick = (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        view.scrollTo({
          top: trigger.start + (i + 0.35) / panels.length * (trigger.end - trigger.start),
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
