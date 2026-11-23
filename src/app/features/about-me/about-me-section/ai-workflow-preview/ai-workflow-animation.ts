import { gsap } from 'gsap';
import type { WorkflowPhase, WorkflowScene } from './ai-workflow-state';
import { buildKnowledgeTimeline } from './knowledge-preview/knowledge-animation';
import { buildOperationsTimeline } from './operations-preview/operations-animation';

interface WorkflowCallbacks {
  phase: (phase: WorkflowPhase) => void;
  scene: (scene: WorkflowScene) => void;
  playback: (playing: boolean) => void;
}

export function animateAiWorkflow(root: HTMLElement, callbacks: WorkflowCallbacks): gsap.MatchMedia {
  const motion = gsap.matchMedia();
  const panel = root.closest<HTMLElement>('.about-panel');
  const document = root.ownerDocument;
  const main = root.querySelector<HTMLElement>('.workflow-main-anchor');
  const anchors = Array.from(root.querySelectorAll<HTMLElement>('.workflow-helper-anchor'));
  if (!main || anchors.length !== 2) return motion;

  motion.add({
    animate: '(prefers-reduced-motion: no-preference)',
    reduce: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    callbacks.playback(false);
    callbacks.scene('team');
    callbacks.phase('complete');
    if (context.conditions?.['reduce']) return;

    const timeline = gsap.timeline({
      paused: true,
      repeat: -1,
      defaults: { duration: 0.4, ease: 'power2.out' },
    });
    const phase = (name: WorkflowPhase, at: number) => {
      timeline.addLabel(name, at).call(() => callbacks.phase(name), [], at);
    };

    // Animate wrappers, never the Blobatar-owned expression/gaze transforms.
    timeline
      .call(() => callbacks.scene('team'), [], 0)
      .set('.workflow-team-scene', { autoAlpha: 1 }, 0)
      .set('.workflow-knowledge-scene, .workflow-operations-scene', { autoAlpha: 0 }, 0)
      .set('.workflow-main-motion', { scale: 1, y: 0 }, 0)
      .set('.workflow-request, .workflow-reply', { autoAlpha: 0, y: -8 }, 0)
      .set('.workflow-helper-motion', { autoAlpha: 0 }, 0)
      .set('.workflow-tool', { autoAlpha: 0, y: 5 }, 0)
      .set('.workflow-link', { autoAlpha: 0, strokeDashoffset: 100 }, 0)
      .set('.workflow-packet, .workflow-return', { autoAlpha: 0, x: 0, y: 0 }, 0);

    phase('idle', 0);
    phase('request', 0.45);
    timeline.to('.workflow-request', { autoAlpha: 1, y: 0, duration: 0.55 }, 'request');

    phase('thinking', 1.9);
    timeline
      .to('.workflow-main-motion', { scale: 1.08, duration: 0.25 }, 'thinking')
      .to('.workflow-main-motion', { scale: 1, duration: 0.5, ease: 'back.out(1.4)' }, 'thinking+=0.25')
      .to('.workflow-request', { autoAlpha: 0.45 }, 'thinking+=0.2');

    phase('delegating', 3.3);
    timeline
      .to('.workflow-link', { autoAlpha: 0.35, strokeDashoffset: 0, duration: 0.7 }, 'delegating')
      .fromTo('.workflow-helper-motion', {
        autoAlpha: 0,
        scale: 0.2,
        x: (i) => main.offsetLeft - anchors[i].offsetLeft,
        y: (i) => main.offsetTop - anchors[i].offsetTop,
      }, {
        autoAlpha: 1, scale: 1, x: 0, y: 0,
        stagger: 0.18, duration: 0.7, ease: 'back.out(1.5)', immediateRender: false,
      }, 'delegating+=0.15')
      .to('.workflow-tool', {
        autoAlpha: 1, y: 0, stagger: 0.18,
      }, 'delegating+=0.6');

    phase('tools', 4.55);
    for (let pass = 0; pass < 3; pass++) {
      const at = 4.65 + pass * 0.9;
      timeline
        .set('.workflow-packet', { autoAlpha: 1, x: 0, y: 0 }, at)
        .to('.workflow-packet', {
          x: (i) => i === 0 ? -134 : 134,
          y: 59, duration: 0.6, stagger: 0.12, ease: 'none',
        }, at)
        .to('.workflow-packet', { autoAlpha: 0, duration: 0.12 }, at + 0.72);
    }

    phase('analyst-done', 6.65);
    phase('collecting', 7.65);
    timeline
      .fromTo('.workflow-return', {
        autoAlpha: 1, x: (i) => i === 0 ? -134 : 134, y: 59,
      }, {
        x: 0, y: 0, duration: 0.75, stagger: 0.2, ease: 'power2.inOut', immediateRender: false,
      }, 'collecting+=0.1')
      .to('.workflow-return', { autoAlpha: 0, duration: 0.15 }, 'collecting+=1.05')
      .to('.workflow-helper-motion', { autoAlpha: 0, scale: 0.85, y: -5 }, 'collecting+=1.2')
      .to('.workflow-link', { autoAlpha: 0 }, 'collecting+=1.35');

    phase('drafting', 9.4);
    timeline
      .to('.workflow-request', { autoAlpha: 0, y: -8 }, 'drafting')
      .to('.workflow-main-motion', { scale: 1.05 }, 'drafting')
      .to('.workflow-main-motion', { scale: 1 }, 'drafting+=0.4');

    phase('complete', 10.6);
    timeline
      .to('.workflow-reply', { autoAlpha: 1, y: 0, duration: 0.55 }, 'complete')
      .to('.workflow-main-motion', { y: -6, duration: 0.22 }, 'complete')
      .to('.workflow-main-motion', { y: 0, duration: 0.55, ease: 'back.out(1.7)' }, 'complete+=0.22')
      .to('.workflow-reply', { autoAlpha: 0, y: -8 }, 13.3)
      .to({}, { duration: 0.7 }, 13.7);

    // The three illustrations share one clock and one lifecycle. Only the main
    // blobatar persists between scenes; hidden helpers never keep animating.
    timeline
      .to('.workflow-team-scene', { autoAlpha: 0 }, 13.7)
      .addLabel('knowledge', 14.4)
      .call(() => callbacks.scene('knowledge'), [], 'knowledge')
      .to('.workflow-knowledge-scene', { autoAlpha: 1 }, 'knowledge')
      .add(buildKnowledgeTimeline(root, callbacks.phase), 'knowledge')
      .to('.workflow-knowledge-scene', { autoAlpha: 0 }, 27.4)
      .addLabel('operations', 28)
      .call(() => callbacks.scene('operations'), [], 'operations')
      .to('.workflow-operations-scene', { autoAlpha: 1 }, 'operations')
      .add(buildOperationsTimeline(callbacks.phase), 'operations')
      .to('.workflow-operations-scene', { autoAlpha: 0 }, 40.9)
      .to({}, { duration: 0.4 }, 41.4);

    let inViewport = false;
    let disposed = false;
    const syncPlayback = () => {
      if (disposed) return;
      const active = panel?.getAttribute('aria-hidden') !== 'true' && !panel?.inert;
      const playing = inViewport && active && !document.hidden;
      timeline.paused(!playing);
      callbacks.playback(playing);
    };
    const intersection = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting && entry.intersectionRatio > 0;
      syncPlayback();
    }, { threshold: [0, 0.1] });
    intersection.observe(root);

    const selection = new MutationObserver(syncPlayback);
    if (panel) selection.observe(panel, { attributes: true, attributeFilter: ['aria-hidden', 'inert'] });
    document.addEventListener('visibilitychange', syncPlayback);

    // New layout measurements are used for the next spawn after a resize.
    const resize = new ResizeObserver(() => timeline.invalidate());
    resize.observe(root);

    return () => {
      disposed = true;
      intersection.disconnect();
      selection.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      callbacks.playback(false);
      callbacks.scene('team');
      callbacks.phase('complete');
    };
  }, root);

  return motion;
}
