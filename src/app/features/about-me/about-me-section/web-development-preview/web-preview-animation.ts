import { gsap } from 'gsap';
import { observePreviewPlayback } from '../../../../shared/animations/preview-playback';

export function animateWebPreview(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const templates = Array.from(root.querySelectorAll<HTMLElement>('[data-preview-template]'));
  const parts = Array.from(root.querySelectorAll<HTMLElement>('[data-preview-part]'));
  const panel = root.closest<HTMLElement>('.about-panel');

  const required = [
    '.preview-site .preview-nav', '.preview-heading-line', '.preview-copy-line',
    '.preview-button', '.preview-image', '.preview-card',
    '.preview-store .preview-store-header', '.preview-store-banner', '.preview-store-filter', '.preview-product',
    '.preview-dashboard .preview-dashboard-sidebar', '.preview-dashboard-toolbar',
    '.preview-stat', '.preview-chart', '.preview-chart-bar', '.preview-dashboard-row',
  ];
  if (templates.length !== 3 || !parts.length || required.some((selector) => !root.querySelector(selector))) {
    return motion;
  }

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const defaults = { duration: 0.45, ease: 'power2.out' };
    gsap.set(templates, { autoAlpha: 0 });
    gsap.set(parts, { autoAlpha: 0, y: 8 });
    gsap.set('.preview-heading-line, .preview-button', { scaleX: 0.8, transformOrigin: 'left center' });
    gsap.set('.preview-image', { scale: 0.94 });
    gsap.set('.preview-store-banner', { scaleX: 0.9, transformOrigin: 'left center' });
    gsap.set('.preview-store-filter', { x: 12, y: 0 });
    gsap.set('.preview-product', { scale: 0.92, y: 14 });
    gsap.set('.preview-dashboard-sidebar', { x: -18, y: 0 });
    gsap.set('.preview-stat', { scale: 0.88 });
    gsap.set('.preview-chart-bar', { scaleY: 0, y: 0, transformOrigin: 'center bottom' });
    gsap.set('.preview-dashboard-row', { x: 10, y: 0 });

    const landing = gsap.timeline({ defaults })
      .to('.preview-nav', { autoAlpha: 1, y: 0, duration: 0.35 }, 0)
      .to('.preview-heading-line', { autoAlpha: 1, y: 0, scaleX: 1, stagger: 0.08 }, 0.15)
      .to('.preview-copy-line', { autoAlpha: 1, y: 0, stagger: 0.06 }, 0.3)
      .to('.preview-image', { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, 0.35)
      .to('.preview-button', { autoAlpha: 1, y: 0, scaleX: 1 }, 0.55)
      .to('.preview-card', { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.7)
      .to('.preview-button', { scale: 1.04, duration: 0.22, repeat: 1, yoyo: true }, 1.5);

    const storefront = gsap.timeline({ defaults })
      .to('.preview-store-header', { autoAlpha: 1, y: 0, duration: 0.3 }, 0)
      .to('.preview-store-banner', { autoAlpha: 1, y: 0, scaleX: 1 }, 0.1)
      .to('.preview-store-filter', { autoAlpha: 1, x: 0, y: 0, stagger: 0.06 }, 0.3)
      .to('.preview-product', {
        autoAlpha: 1, y: 0, scale: 1,
        stagger: { each: 0.08, grid: [2, 3], from: 'start' },
      }, 0.55);

    const dashboard = gsap.timeline({ defaults })
      .to('.preview-dashboard-sidebar', { autoAlpha: 1, x: 0 }, 0)
      .to('.preview-dashboard-toolbar', { autoAlpha: 1, y: 0 }, 0.1)
      .to('.preview-stat', { autoAlpha: 1, y: 0, scale: 1, stagger: 0.09 }, 0.25)
      .to('.preview-chart', { autoAlpha: 1, y: 0 }, 0.45)
      .to('.preview-chart-bar', {
        autoAlpha: 1, scaleY: 1, duration: 0.7, stagger: 0.075, ease: 'power3.out',
      }, 0.65)
      .to('.preview-dashboard-row', { autoAlpha: 1, x: 0, stagger: 0.1 }, 0.9);

    const timeline = gsap.timeline({ paused: true, repeat: -1, defaults });
    [landing, storefront, dashboard].forEach((build, i) => {
      const start = i * 4.2;
      const horizontal = i === 1;
      timeline
        .addLabel(templates[i].dataset['previewTemplate']!, start)
        .fromTo(templates[i], {
          autoAlpha: 0, x: horizontal ? 16 : 0, y: horizontal ? 0 : 10,
        }, { autoAlpha: 1, x: 0, y: 0, duration: 0.35 }, start)
        .add(build, start + 0.05)
        // Keep the completed layout visible before transitioning within the same browser frame.
        .to(templates[i], {
          autoAlpha: 0, x: horizontal ? -12 : 0, y: horizontal ? 0 : -8,
          duration: 0.3, ease: 'power1.in',
        }, start + 3.9);
    });

    return observePreviewPlayback(root, (playing) => timeline.paused(!playing), panel);
  }, root);

  return motion;
}
