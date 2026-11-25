import { ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import type { WorkflowPhase } from '../ai-workflow-state';

@Component({
  selector: 'app-operations-preview',
  imports: [],
  templateUrl: './operations-preview.html',
  styleUrl: './operations-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsPreview {
  readonly phase = input<WorkflowPhase>('restored');
  readonly health = viewChild<ElementRef<HTMLElement>>('health');
  readonly log = viewChild<ElementRef<HTMLElement>>('log');
  protected readonly degraded = computed(() => ['incident', 'investigating', 'repairing'].includes(this.phase()));
  protected readonly healthLabel = computed(() => {
    if (this.degraded()) return $localize`:@@aiOperations.degraded:Degraded`;
    if (this.phase() === 'verifying') return $localize`:@@aiOperations.recovering:Recovering`;
    return $localize`:@@aiOperations.healthy:Healthy`;
  });
}
