import { gsap } from 'gsap';
import { animateAiWorkflow } from './ai-workflow-animation';
import type { WorkflowPhase, WorkflowScene } from './ai-workflow-state';

describe('AI workflow animation', () => {
  let root: HTMLElement;
  let motion: gsap.MatchMedia | undefined;
  let reducedMotion: boolean;
  let resize: () => void;
  let width: number;
  let height: number;
  let scene: WorkflowScene;
  let phase: WorkflowPhase;
  let playing: boolean;

  function element(selector: string): HTMLElement {
    return root.querySelector<HTMLElement>(selector)!;
  }

  function start(): gsap.core.Timeline {
    motion = animateAiWorkflow(root, {
      phase: (value) => phase = value,
      scene: (value) => scene = value,
      playback: (value) => playing = value,
    });
    return gsap.getTweensOf(element('.workflow-team-scene'))
      .find((tween) => tween.duration() > 0)!.parent!;
  }

  beforeEach(() => {
    reducedMotion = false;
    width = 500;
    height = 300;
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query) => {
      const media = matchMedia(query);
      if (query.startsWith('(prefers-reduced-motion:')) {
        Object.defineProperty(media, 'matches', {
          value: query.includes('no-preference') ? !reducedMotion : reducedMotion,
        });
      }
      return media;
    });
    spyOn(window, 'ResizeObserver').and.callFake(function (callback) {
      const observer = jasmine.createSpyObj<ResizeObserver>(
        'ResizeObserver', ['observe', 'unobserve', 'disconnect'],
      );
      resize = () => callback([], observer);
      return observer;
    });

    root = document.createElement('div');
    root.innerHTML = `
      <div class="workflow-team-scene">
        <div class="workflow-request"></div><div class="workflow-reply"></div>
        <div class="workflow-helper-anchor"><div class="workflow-helper-motion"><div class="workflow-tool"></div></div></div>
        <div class="workflow-helper-anchor"><div class="workflow-helper-motion"><div class="workflow-tool"></div></div></div>
        <svg><path class="workflow-link"/><circle class="workflow-packet"/><circle class="workflow-return"/></svg>
      </div>
      <div class="workflow-knowledge-scene" style="opacity: 0; visibility: hidden">
        <div class="knowledge-question"></div><div class="knowledge-answer"></div><div class="knowledge-citation"></div>
        <div class="knowledge-invoices"><div class="knowledge-document-motion"></div></div>
        <div class="knowledge-fragment"></div><div class="knowledge-fragment"></div>
      </div>
      <div class="workflow-operations-scene" style="opacity: 0; visibility: hidden">
        <div class="operations-healthy"></div><div class="operations-alert"></div>
        <div class="operations-log"></div><div class="operations-scan"></div><div class="operations-result"></div>
        <div class="operations-action"><span class="operations-action-icon"></span></div>
        <svg><path class="operations-failure"/><path class="operations-recovery"/></svg>
      </div>
      <div class="workflow-main-anchor"><div class="workflow-main-motion"></div></div>
    `;
    Object.defineProperties(root, {
      clientWidth: { get: () => width },
      clientHeight: { get: () => height },
    });
    Object.defineProperties(element('.workflow-main-anchor'), {
      offsetLeft: { get: () => width / 2 },
      offsetTop: { get: () => height / 2 },
    });
    Object.defineProperties(element('.workflow-helper-anchor'), {
      offsetLeft: { get: () => width / 4 },
      offsetTop: { get: () => height * 0.75 },
    });
    document.body.appendChild(root);
  });

  afterEach(() => {
    motion?.revert();
    motion = undefined;
    root.remove();
  });

  it('updates helper and knowledge travel after a resize without rebuilding the clock', () => {
    const timeline = start();
    const helper = element('.workflow-helper-motion');
    const fragment = element('.knowledge-fragment');
    const spawnTime = 3.55;
    const readTime = 18.95;

    timeline.time(spawnTime);
    const helperX = Number(gsap.getProperty(helper, 'x'));
    expect(helperX).toBeGreaterThan(0);
    timeline.time(readTime);
    const fragmentX = Number(gsap.getProperty(fragment, 'x'));
    expect(fragmentX).toBeCloseTo(75, 0);

    width *= 2;
    height *= 2;
    resize();
    expect(timeline.time()).toBeCloseTo(readTime, 3);

    timeline.time(spawnTime);
    expect(Number(gsap.getProperty(helper, 'x'))).toBeCloseTo(helperX * 2, 0);
    timeline.time(readTime);
    expect(Number(gsap.getProperty(fragment, 'x'))).toBeCloseTo(fragmentX * 2, 0);
  });

  for (const activeScene of ['knowledge', 'operations'] as const) {
    it(`restores the static team after resizing in ${activeScene} and enabling reduced motion`, () => {
      const elements = Array.from(root.querySelectorAll<HTMLElement>(
        '.workflow-team-scene, .workflow-knowledge-scene, .workflow-operations-scene, .workflow-reply',
      ));
      const staticStyles = elements.map((item) => item.style.cssText);
      const timeline = start();
      timeline.time(timeline.labels[activeScene] + 1);
      expect(scene).toBe(activeScene);
      expect(element(`.workflow-${activeScene}-scene`).style.visibility).not.toBe('hidden');

      width -= 40;
      resize();
      reducedMotion = true;
      gsap.matchMediaRefresh();

      expect(scene).toBe('team');
      expect(phase).toBe('complete');
      expect(playing).toBeFalse();
      expect(elements.map((item) => item.style.cssText)).toEqual(staticStyles);
    });
  }
});
