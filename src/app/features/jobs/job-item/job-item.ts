import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Job } from '../../../core/models/job';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { RouterLink } from '@angular/router';
import { PortfolioPeriod } from '../../../shared/portfolio/portfolio-period';

@Component({
  selector: 'app-job-item',
  imports: [
    ImageUrlPipe,
    RouterLink,
    PortfolioPeriod,
  ],
  templateUrl: './job-item.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './job-item.scss',
})
export class JobItem {
  @Input({ required: true }) job!: Job;
}
