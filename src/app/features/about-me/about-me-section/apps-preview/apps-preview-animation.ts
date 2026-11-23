import { gsap } from 'gsap';

const SCENE_DURATION = 4.6;
const TRANSITION = 0.26;
const ACTION_DELAY = 0.45;
const NOTE_READING_HOLD = 0.5;

export function animateAppsPreview(root: HTMLElement): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const panel = root.closest<HTMLElement>('.about-panel');
  const document = root.ownerDocument;
  const step = (name: string) => root.querySelectorAll(`[data-app-step="${name}"]`);
  const pairs = ['vault', 'studio', 'notes'].map((name) =>
    root.querySelectorAll<HTMLElement>(`[data-app-scene="${name}"]`),
  );

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const timeline = gsap.timeline({
      paused: true,
      repeat: -1,
      defaults: { duration: 0.25, ease: 'power2.out', immediateRender: false },
    });

    pairs.slice(1).forEach((pair, index) => {
      const start = (index + 1) * SCENE_DURATION;
      timeline
        .fromTo(pair, { autoAlpha: 0, y: 3 }, { autoAlpha: 1, y: 0, duration: TRANSITION }, start)
        .set(pairs[index], { autoAlpha: 0 }, start + TRANSITION);
    });

    // The vault is already behind the notebook when the last scene fades out.
    const returnToVault = pairs.length * SCENE_DURATION + NOTE_READING_HOLD - TRANSITION;
    timeline
      .set(pairs[0], { autoAlpha: 1 }, returnToVault)
      .set(step('vault-lock'), { autoAlpha: 1 }, returnToVault)
      .to(pairs[2], { autoAlpha: 0, duration: TRANSITION }, returnToVault);

    timeline
      .addLabel('unlock', ACTION_DELAY)
      .addLabel('face-scan', 'unlock+=0.26')
      .addLabel('vault-verified', 'unlock+=1.27')
      .to(step('biometric'), { autoAlpha: 1 }, 'unlock')
      .to(step('fingerprint'), { strokeDashoffset: 0, duration: 0.85 }, 'unlock+=0.18')
      .set(step('face-scan'), { autoAlpha: 1 }, 'face-scan')
      .to(step('face-scan'), { attr: { y1: 21, y2: 21 }, duration: 0.86, ease: 'none' }, 'face-scan')
      .set(step('face-scan'), { autoAlpha: 0 }, 'vault-verified')
      .set(step('vault-lock'), { autoAlpha: 0 }, 'vault-verified')
      .fromTo(step('verified'), { autoAlpha: 0, scale: 0.72 }, { autoAlpha: 1, scale: 1 }, 'vault-verified')
      .to(step('biometric'), { autoAlpha: 0 }, 'unlock+=1.85');

    timeline
      .addLabel('attach', SCENE_DURATION + ACTION_DELAY)
      .fromTo(step('file-picker'), { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0 }, 'attach')
      .fromTo(step('camera'), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1 }, 'attach')
      .set(step('paper'), { rotation: -12 }, 'attach')
      .fromTo(step('scan-beam'), { autoAlpha: 0, top: '13%' },
        { autoAlpha: 1, top: '85%', duration: 1.1, ease: 'none' }, 'attach+=0.43')
      .to(step('paper'), { rotation: 0, duration: 0.38 }, 'attach+=1.1')
      .fromTo(step('drag-ghost'), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1 }, 'attach+=0.5')
      .to(step('drag-source'), { opacity: 0.38 }, 'attach+=0.52')
      .to(step('drag-ghost'), { left: '94%', top: '87%', duration: 0.95, ease: 'power2.inOut' }, 'attach+=0.74')
      .to(step('drop-target'), { opacity: 1 }, 'attach+=1.32')
      .to(step('drag-ghost'), { autoAlpha: 0, scale: 0.45 }, 'attach+=1.72')
      .to(step('drop-target'), { autoAlpha: 0 }, 'attach+=1.78')
      .to(step('camera'), { autoAlpha: 0 }, 'attach+=1.78')
      .to(step('file-picker'), { autoAlpha: 0, y: 4 }, 'attach+=1.98')
      .fromTo([...step('drop-check'), ...step('scan-check')], { autoAlpha: 0, scale: 0.7 },
        { autoAlpha: 1, scale: 1 }, 'attach+=1.98');

    timeline
      .addLabel('handoff', 2 * SCENE_DURATION + ACTION_DELAY)
      .addLabel('note-open', 'handoff+=2.22')
      .to(step('offline'), { autoAlpha: 0 }, 'handoff+=0.35')
      .to(step('synced'), { autoAlpha: 1 }, 'handoff+=0.5')
      .to(step('sync-row'), { scale: 1.04, repeat: 1, yoyo: true }, 'handoff+=0.5')
      .fromTo(step('notification'), { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0 }, 'handoff+=0.83')
      .fromTo(step('toast-pointer'), { autoAlpha: 0, x: 12, y: 8 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.42 }, 'handoff+=1.67')
      .fromTo(step('toast-tap'), { autoAlpha: 0, scale: 0.45 },
        { autoAlpha: 1, scale: 1, duration: 0.15 }, 'handoff+=2.02')
      .to(step('toast-pointer'), { scale: 0.8, duration: 0.12 }, 'handoff+=2.12')
      .to(step('notification'), { autoAlpha: 0, y: -4 }, 'note-open')
      .fromTo(step('note-detail'), { autoAlpha: 0, y: 5 },
        { autoAlpha: 1, y: 0, duration: 0.36 }, 'note-open');

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
