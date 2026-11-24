import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeMetadataPills } from '../../../../shared/home-metadata-pills/home-metadata-pills';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url-pipe';
import { RealizationSummary } from '../../../../core/models/summary/realization';

@Component({
  selector: 'app-realization-showcase-card',
  imports: [RouterLink, ImageUrlPipe, HomeMetadataPills],
  templateUrl: './realization-showcase-card.html',
  styleUrl: './realization-showcase-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'realization-showcase',
  },
})
export class RealizationShowcaseCard {
  readonly realization = input.required<RealizationSummary>();
  protected readonly thumbnailFailed = linkedSignal({
    source: () => this.realization().thumbnail,
    computation: () => false,
  });
}
