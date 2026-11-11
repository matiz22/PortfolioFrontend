import { gsap } from 'gsap';
import type { WorkflowPhase } from '../ai-workflow-state';

export function buildOperationsTimeline(onPhase: (phase: WorkflowPhase) => void): gsap.core.Timeline {
  const timeline = gsap.timeline({ defaults: { duration: 0.4, ease: 'power2.out' } });
  const phase = (name: WorkflowPhase, at: number) => {
    timeline.addLabel(name, at).call(() => onPhase(name), [], at);
  };
  timeline
    .set('.operations-healthy', { autoAlpha: 1 }, 0)
    .set('.operations-log, .operations-action, .operations-result, .operations-alert, .operations-scan', { autoAlpha: 0, y: 0 }, 0)
    .set('.operations-failure, .operations-recovery', { autoAlpha: 0, strokeDashoffset: 100 }, 0);

  phase('monitoring', 0.01);
  timeline
    .set('.operations-scan', { autoAlpha: 1, x: 0 }, 0.4)
    .to('.operations-scan', { x: 242, duration: 1.7, ease: 'none' }, 0.4)
    .to('.operations-scan', { autoAlpha: 0, duration: 0.15 }, 2.1);

  phase('incident', 2.2);
  timeline
    .to('.operations-healthy', { autoAlpha: 0, duration: 0.2 }, 'incident')
    .to('.operations-failure', { autoAlpha: 1, strokeDashoffset: 0, duration: 0.65 }, 'incident')
    .fromTo('.operations-alert', { autoAlpha: 0, scale: 0.5, transformOrigin: 'center' }, {
      autoAlpha: 1, scale: 1.4, duration: 0.4, repeat: 3, yoyo: true, immediateRender: false,
    }, 'incident+=0.4');

  phase('investigating', 4);
  timeline.fromTo('.operations-log', { autoAlpha: 0, y: 8, scale: 0.95 }, {
    autoAlpha: 1, y: 0, scale: 1, duration: 0.55, immediateRender: false,
  }, 'investigating');

  phase('repairing', 6.1);
  timeline
    .to('.operations-log', { autoAlpha: 0, y: -6 }, 'repairing')
    .fromTo('.operations-action', { autoAlpha: 0, y: 6 }, {
      autoAlpha: 1, y: 0, immediateRender: false,
    }, 'repairing+=0.35')
    .fromTo('.operations-action-icon', { rotation: 0 }, {
      rotation: 360, duration: 1.3, ease: 'power2.inOut', immediateRender: false,
    }, 'repairing+=0.4');

  phase('verifying', 8.1);
  timeline
    .to('.operations-recovery', { autoAlpha: 1, strokeDashoffset: 0, duration: 1, ease: 'none' }, 'verifying')
    .to('.operations-alert, .operations-action', { autoAlpha: 0 }, 'verifying+=0.35');

  phase('restored', 9.5);
  timeline
    .fromTo('.operations-result', { autoAlpha: 0, y: 6 }, {
      autoAlpha: 1, y: 0, duration: 0.55, immediateRender: false,
    }, 'restored')
    .to({}, { duration: 0.8 }, 12.2);
  return timeline;
}
