import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'a[appArchiveCard], article[appArchiveCard]',
  template: '<ng-content />',
  // The named card classes also style content projected by the feature items.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './archive-card.scss',
})
export class ArchiveCard {}
