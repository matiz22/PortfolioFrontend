import { gsap } from 'gsap';

const SCENES = ['productivity', 'analytics', 'messaging'] as const;

export function animateAppsPreview(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const templates = Array.from(root.querySelectorAll<HTMLElement>('[data-app-template]'));
  const parts = Array.from(root.querySelectorAll<HTMLElement>('[data-app-part]'));
  const panel = root.closest<HTMLElement>('.about-panel');
  const document = root.ownerDocument;
  const required = [
    '.app-board-toolbar', '.app-board-column', '.app-task-card', '.app-task-heading',
    '.app-task-progress', '.app-task-row', '.app-task-check-fill',
    '.app-analytics-heading', '.app-metric-card', '.app-trend-chart', '.app-analytics-bar',
    '.app-phone-metric-value', '.app-activity-row', '.app-inbox-heading', '.app-inbox-row',
    '.app-chat-heading', '.app-chat-bubble', '.app-chat-composer', '.app-typing', '.app-typing-dot',
  ];
  const completePairs = SCENES.every((scene) => ['desktop', 'phone'].every((device) =>
    templates.filter((template) => template.dataset['appTemplate'] === scene &&
      template.dataset['appDevice'] === device).length === 1,
  ));

  if (templates.length !== 6 || !completePairs || !parts.length ||
    required.some((selector) => !root.querySelector(selector))) {
    return motion;
  }

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const defaults = { duration: 0.45, ease: 'power2.out' };
    gsap.set(templates, { autoAlpha: 0 });
    gsap.set(parts, { autoAlpha: 0, y: 8 });
    gsap.set('.app-board-column', { x: -8, y: 0 });
    gsap.set('.app-task-card', { scale: 0.9 });
    gsap.set('.app-task-row', { x: 10, y: 0 });
    gsap.set('.app-task-check-fill', { scale: 0, y: 0 });
    gsap.set('.app-task-progress', { scaleX: 0, y: 0, transformOrigin: 'left center' });
    gsap.set('.app-metric-card', { scale: 0.9 });
    gsap.set('.app-analytics-bar', { scaleY: 0, y: 0, transformOrigin: 'center bottom' });
    gsap.set('.app-phone-metric-value', { scaleX: 0.65, y: 0, transformOrigin: 'left center' });
    gsap.set('.app-inbox-row', { x: -10, y: 0 });
    gsap.set('.app-chat-bubble', { scale: 0.9 });

    const productivity = gsap.timeline({ defaults })
      .to('.app-board-toolbar, .app-task-heading', { autoAlpha: 1, y: 0 }, 0)
      .to('.app-board-column', { autoAlpha: 1, x: 0, stagger: 0.08 }, 0.1)
      .to('.app-task-card', { autoAlpha: 1, y: 0, scale: 1, stagger: 0.07 }, 0.25)
      .to('.app-task-row', { autoAlpha: 1, x: 0, stagger: 0.08 }, 0.2)
      .to('.app-task-progress', { autoAlpha: 1, scaleX: 1, duration: 0.8 }, 0.4)
      .to('.app-task-check-fill', { autoAlpha: 1, scale: 1, duration: 0.25, stagger: 0.15 }, 1.2);

    const analytics = gsap.timeline({ defaults })
      .to('.app-analytics-heading', { autoAlpha: 1, y: 0 }, 0)
      .to('.app-metric-card', { autoAlpha: 1, y: 0, scale: 1, stagger: 0.07 }, 0.15)
      .to('.app-trend-chart', { autoAlpha: 1, y: 0 }, 0.3)
      .to('.app-phone-metric-value', { autoAlpha: 1, scaleX: 1 }, 0.4)
      .to('.app-analytics-bar', {
        autoAlpha: 1, scaleY: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out',
      }, 0.5)
      .to('.app-activity-row', { autoAlpha: 1, y: 0, stagger: 0.08 }, 0.65);

    const messaging = gsap.timeline({ defaults })
      .to('.app-inbox-heading, .app-chat-heading', { autoAlpha: 1, y: 0 }, 0)
      .to('.app-inbox-row', { autoAlpha: 1, x: 0, stagger: 0.08 }, 0.1)
      .to('.app-chat-composer', { autoAlpha: 1, y: 0 }, 0.3)
      .to('.app-typing', { autoAlpha: 1, y: 0 }, 0.2)
      .to('.app-typing-dot', { y: -2, duration: 0.2, repeat: 3, yoyo: true, stagger: 0.1 }, 0.3);
    for (let message = 0; message < 5; message++) {
      messaging.to(`.app-chat-bubble[data-message="${message}"]`, {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.35,
      }, 0.45 + message * 0.22);
    }

    const timeline = gsap.timeline({ paused: true, repeat: -1, defaults });
    [productivity, analytics, messaging].forEach((build, i) => {
      const pair = templates.filter((template) => template.dataset['appTemplate'] === SCENES[i]);
      const start = i * 4.8;
      timeline
        .addLabel(SCENES[i], start)
        .fromTo(pair, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35 }, start)
        .add(build, start + 0.05)
        .to(pair, { autoAlpha: 0, y: -8, duration: 0.3, ease: 'power1.in' }, start + 4.5);
    });

    let inViewport = false;
    let disposed = false;
    const syncPlayback = () => {
      if (!disposed) {
        const active = panel?.getAttribute('aria-hidden') !== 'true' && !panel?.inert;
        timeline.paused(!inViewport || !active || document.hidden);
      }
    };
    const intersection = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting && entry.intersectionRatio > 0;
      syncPlayback();
    }, { threshold: 0.1 });
    intersection.observe(root);

    const selection = new MutationObserver(syncPlayback);
    if (panel) {
      selection.observe(panel, { attributes: true, attributeFilter: ['aria-hidden', 'inert'] });
    }
    document.addEventListener('visibilitychange', syncPlayback);

    return () => {
      disposed = true;
      intersection.disconnect();
      selection.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, root);

  return motion;
}
