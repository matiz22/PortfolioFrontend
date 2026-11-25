import { gsap } from 'gsap';

export function animatePortfolioHero(root: HTMLElement): () => void {
  const view = root.ownerDocument.defaultView;
  const copy = root.querySelector<HTMLElement>('[data-case-copy]');
  if (!view || !copy) return () => undefined;

  const actions = root.querySelector<HTMLElement>('[data-case-actions]');
  const preview = root.querySelector<HTMLElement>('.case-preview');
  const artwork = preview?.querySelector('img');
  const motion = gsap.matchMedia(root);
  let played = false;

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    if (played) return;
    played = true;

    const desktop = view.matchMedia('(min-width: 64rem)').matches;
    const previewLeads = desktop && !!preview;
    const frameAt = previewLeads ? 0 : 0.12;
    const copyAt = previewLeads ? 0.13 : 0;
    const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (preview) {
      hero.fromTo(preview, {
        opacity: 0.32,
        x: desktop ? 38 : 0,
        y: desktop ? 6 : 18,
        scale: 0.97,
        rotationY: desktop ? -5 : 0,
        transformPerspective: 1100,
      }, {
        opacity: 1, x: 0, y: 0, scale: 1, rotationY: 0, transformPerspective: 1100,
        duration: 0.62, clearProps: 'opacity,transform',
      }, frameAt);
    }

    // Let the picture take a slightly longer path than its frame.
    if (artwork) {
      hero.from(artwork, {
        x: desktop ? 24 : 0, y: desktop ? 0 : 12,
        scale: 1.075, duration: desktop ? 0.67 : 0.59, clearProps: 'transform',
      }, frameAt + (desktop ? 0.07 : 0.04));
    }

    hero.from(copy, {
      opacity: 0.46, x: desktop ? -26 : -12, y: desktop ? 0 : 10,
      duration: 0.52, clearProps: 'opacity,transform',
    }, copyAt);

    if (actions) {
      hero.from(actions, {
        opacity: 0.35, y: 12, duration: 0.42, clearProps: 'opacity,transform',
      }, copyAt + 0.17);
    }
  });

  return () => motion.revert();
}
