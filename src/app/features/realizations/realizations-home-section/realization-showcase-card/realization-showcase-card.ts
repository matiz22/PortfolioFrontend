import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url-pipe';
import { RealizationSummary } from '../../../../core/models/summary/realization';

@Component({
  selector: 'app-realization-showcase-card',
  imports: [RouterLink, ImageUrlPipe],
  templateUrl: './realization-showcase-card.html',
  styleUrl: './realization-showcase-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'realization-showcase',
  },
})
export class RealizationShowcaseCard {
  readonly realization = input.required<RealizationSummary>();
  // Full stack list; the details page groups it the same way.
  readonly techLine = computed(() =>
    this.realization()
      .technologies.map((technology) => technology.name)
      .join(' · ')
  );
}
