import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { Blobatar } from '@blobatar/angular';
import { BlobatarGaze, type GazeTarget } from '@blobatar/angular/gaze';
import { happy, idle, surprised, thinking } from 'blobatar/expression';
import { afterNextRenderMotion } from '../../../../shared/animations/lazy-motion';
import { type WorkflowPhase, type WorkflowScene } from './ai-workflow-state';
import { KnowledgePreview } from './knowledge-preview/knowledge-preview';
import { OperationsPreview } from './operations-preview/operations-preview';

@Component({
  selector: 'app-ai-workflow-preview',
  imports: [Blobatar, BlobatarGaze, KnowledgePreview, OperationsPreview],
  templateUrl: './ai-workflow-preview.html',
  styleUrl: './ai-workflow-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every rule is namespaced to .ai-workflow, including the adapter's SVG/img.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ai-workflow',
    '[attr.data-phase]': 'phase()',
    '[attr.data-scene]': 'scene()',
    '[class.is-playing]': 'playing()',
  },
})
export class AiWorkflowPreview {
  // A complete, motionless scene is also the SSR / failed-import fallback.
  readonly phase = signal<WorkflowPhase>('complete');
  readonly scene = signal<WorkflowScene>('team');
  readonly playing = signal(false);
  protected readonly request = viewChild<ElementRef<HTMLElement>>('request');
  protected readonly analyst = viewChild<ElementRef<HTMLElement>>('analyst');
  protected readonly researcher = viewChild<ElementRef<HTMLElement>>('researcher');
  protected readonly reply = viewChild<ElementRef<HTMLElement>>('reply');
  protected readonly knowledge = viewChild(KnowledgePreview);
  protected readonly operations = viewChild(OperationsPreview);

  protected readonly motionMode = computed(() => this.playing() ? 'always' as const : false);
  protected readonly helperMotionMode = computed(() => this.scene() === 'team' ? this.motionMode() : false);
  protected readonly successful = computed(() => ['complete', 'answering', 'restored'].includes(this.phase()));
  protected readonly mainExpression = computed(() => {
    switch (this.phase()) {
      case 'idle':
      case 'request':
      case 'question':
      case 'monitoring': return idle;
      case 'complete':
      case 'answering':
      case 'restored': return happy;
      case 'incident': return surprised;
      default: return thinking;
    }
  });
  // Pin the main blob to the droplet silhouette: 0.9 sits in droplet's
  // [0.86, 0.915) slot of blobatar's weighted shape table.
  protected readonly mainTraits = { shape: 0.9 };
  protected readonly analystDone = computed(() =>
    ['analyst-done', 'collecting', 'drafting', 'complete'].includes(this.phase()),
  );
  protected readonly researcherDone = computed(() =>
    ['collecting', 'drafting', 'complete'].includes(this.phase()),
  );
  protected readonly analystExpression = computed(() => this.analystDone() ? happy : thinking);
  protected readonly researcherExpression = computed(() => this.researcherDone() ? happy : thinking);
  protected readonly gazeTarget = computed<GazeTarget>(() => {
    if (!this.playing()) return null;
    if (this.scene() === 'knowledge') {
      if (this.phase() === 'question') return this.knowledge()?.question()?.nativeElement ?? 'rest';
      if (this.phase() === 'reading') return this.knowledge()?.source()?.nativeElement ?? 'rest';
      if (this.phase() === 'answering') return this.knowledge()?.answer()?.nativeElement ?? 'rest';
      return 'rest';
    }
    if (this.scene() === 'operations') {
      return this.phase() === 'investigating'
        ? this.operations()?.log()?.nativeElement ?? 'rest'
        : this.operations()?.health()?.nativeElement ?? 'rest';
    }
    switch (this.phase()) {
      case 'idle': return 'pointer';
      case 'request': return this.request()?.nativeElement ?? 'rest';
      case 'delegating':
      case 'tools': return this.analyst()?.nativeElement ?? 'rest';
      case 'analyst-done': return this.researcher()?.nativeElement ?? 'rest';
      case 'complete': return this.reply()?.nativeElement ?? 'pointer';
      default: return 'rest';
    }
  });
  protected readonly status = computed(() => {
    switch (this.phase()) {
      case 'idle':
      case 'request': return $localize`:@@aiWorkflow.ready:Ready`;
      case 'thinking': return $localize`:@@aiWorkflow.thinking:Thinking`;
      case 'delegating': return 'spawn_agent ×2';
      case 'tools':
      case 'analyst-done': return 'tool_use';
      case 'collecting': return $localize`:@@aiWorkflow.reviewing:Reviewing results`;
      case 'drafting': return $localize`:@@aiWorkflow.drafting:Drafting report`;
      case 'complete': return $localize`:@@aiWorkflow.done:Done`;
      case 'question': return $localize`:@@aiWorkflow.ready:Ready`;
      case 'retrieving': return 'retrieve_context';
      case 'reading': return $localize`:@@aiKnowledge.reading:Reading sources`;
      case 'answering': return $localize`:@@aiKnowledge.cited:Sources cited`;
      case 'monitoring': return $localize`:@@aiOperations.monitoring:Monitoring`;
      case 'incident': return $localize`:@@aiOperations.incident:Incident detected`;
      case 'investigating': return 'inspect_logs';
      case 'repairing': return 'restart_service';
      case 'verifying': return $localize`:@@aiOperations.verifying:Checking recovery`;
      case 'restored': return $localize`:@@aiOperations.resolved:All systems healthy`;
    }
  });

  constructor() {
    afterNextRenderMotion(async () => {
      const { animateAiWorkflow } = await import('./ai-workflow-animation');
      return (root) => animateAiWorkflow(root, {
        phase: (phase) => this.phase.set(phase),
        scene: (scene) => this.scene.set(scene),
        playback: (playing) => this.playing.set(playing),
      });
    }, 'AI workflow animation could not be loaded.');
  }
}
