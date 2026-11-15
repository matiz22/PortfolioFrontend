import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';

@Component({
  selector: 'app-project-preview',
  imports: [RouterLink, ImageUrlPipe],
  templateUrl: './project-preview.html',
  styleUrl: './project-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPreview {
  readonly project = input.required<ProjectSummary>();
  protected readonly visibleTechnologies = computed(() => this.project().technologies.slice(0, 3));
  protected readonly remainingTechnologies = computed(() =>
    this.project().technologies.slice(3).map((technology) => technology.name).join(', '),
  );
  protected readonly thumbnailFailed = linkedSignal({
    source: () => this.project().thumbnail,
    computation: () => false,
  });
}
