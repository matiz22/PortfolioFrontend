import { gsap } from 'gsap';
import type { WorkflowPhase } from '../ai-workflow-state';

export function buildKnowledgeTimeline(root: HTMLElement, onPhase: (phase: WorkflowPhase) => void): gsap.core.Timeline {
  const timeline = gsap.timeline({ defaults: { duration: 0.4, ease: 'power2.out' } });
  const phase = (name: WorkflowPhase, at: number) => {
    timeline.addLabel(name, at).call(() => onPhase(name), [], at);
  };
  timeline
    .set('.knowledge-question, .knowledge-answer, .knowledge-fragment', { autoAlpha: 0, y: 0 }, 0)
    .set('.knowledge-document-motion', { autoAlpha: 0, y: 10, rotation: 0 }, 0)
    .set('.knowledge-citation', { autoAlpha: 0, scale: 0.6 }, 0);

  phase('question', 0.01);
  timeline.fromTo('.knowledge-question', { autoAlpha: 0, y: -8 }, {
    autoAlpha: 1, y: 0, duration: 0.55, immediateRender: false,
  }, 0.3);

  phase('retrieving', 2);
  timeline
    .to('.knowledge-question', { autoAlpha: 0.45 }, 'retrieving')
    .fromTo('.knowledge-document-motion', {
      autoAlpha: 0, y: 18, rotation: (i) => (i - 1) * -8,
    }, {
      autoAlpha: 1, y: 0, rotation: 0, stagger: 0.18, duration: 0.65,
      ease: 'back.out(1.2)', immediateRender: false,
    }, 'retrieving+=0.1');

  phase('reading', 3.9);
  timeline.to('.knowledge-invoices .knowledge-document-motion', { autoAlpha: 0.35 }, 'reading');
  for (let pass = 0; pass < 2; pass++) {
    const at = 4.2 + pass * 1.15;
    timeline
      .set('.knowledge-fragment', { autoAlpha: 1, x: 0, y: 0 }, at)
      .to('.knowledge-fragment', {
        x: (i) => root.clientWidth * (i === 0 ? 0.30 : -0.34),
        y: () => -root.clientHeight * 0.24,
        duration: 0.7, stagger: 0.15, ease: 'power2.inOut',
      }, at)
      .to('.knowledge-fragment', { autoAlpha: 0, duration: 0.15 }, at + 0.85);
  }

  phase('answering', 7.2);
  timeline
    .to('.knowledge-question', { autoAlpha: 0, y: -8 }, 'answering')
    .fromTo('.knowledge-answer', { autoAlpha: 0, y: 6 }, {
      autoAlpha: 1, y: 0, duration: 0.55, immediateRender: false,
    }, 'answering+=0.3')
    .to('.knowledge-citation', { autoAlpha: 1, scale: 1, stagger: 0.15 }, 'answering+=0.75')
    .to('.knowledge-answer', { autoAlpha: 0, y: -6 }, 11.8)
    .to({}, { duration: 0.8 }, 12.2);
  return timeline;
}
