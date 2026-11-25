import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { HomeMetadataPills } from '../../../shared/home-metadata-pills/home-metadata-pills';

@Component({
  selector: 'app-project-preview',
  imports: [RouterLink, ImageUrlPipe, HomeMetadataPills],
  templateUrl: './project-preview.html',
  styleUrl: './project-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPreview {
  readonly project = input.required<ProjectSummary>();
  protected readonly thumbnailFailed = linkedSignal({
    source: () => this.project().thumbnail,
    computation: () => false,
  });
}
