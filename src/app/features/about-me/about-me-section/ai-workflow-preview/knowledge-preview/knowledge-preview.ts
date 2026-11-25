import { ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import type { WorkflowPhase } from '../ai-workflow-state';

@Component({
  selector: 'app-knowledge-preview',
  imports: [],
  templateUrl: './knowledge-preview.html',
  styleUrl: './knowledge-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgePreview {
  readonly phase = input<WorkflowPhase>('answering');
  readonly question = viewChild<ElementRef<HTMLElement>>('question');
  readonly source = viewChild<ElementRef<HTMLElement>>('source');
  readonly answer = viewChild<ElementRef<HTMLElement>>('answer');
  protected readonly grounded = computed(() => ['reading', 'answering'].includes(this.phase()));
}
