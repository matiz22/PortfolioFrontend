import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobSummary } from '../../../../core/models/summary/job';
import { HomeMetadataPills } from '../../../../shared/home-metadata-pills/home-metadata-pills';

@Component({
  selector: 'li[appJobTimelineEntry]',
  imports: [DatePipe, RouterLink, HomeMetadataPills],
  templateUrl: './job-timeline-entry.html',
  styleUrl: './job-timeline-entry.scss',
  // Entry styles respond to the timeline parent's layout and pinning classes.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'jobs-entry grid min-w-0',
    'data-home-rail-item': '',
    '[class.jobs-entry-current]': 'job().isCurrent',
  },
})
export class JobTimelineEntry {
  readonly job = input.required<JobSummary>();
}
