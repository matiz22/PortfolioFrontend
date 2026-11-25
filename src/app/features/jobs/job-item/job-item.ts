import { Component, Input } from '@angular/core';
import { Job } from '../../../core/models/job';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { RouterLink } from '@angular/router';
import { ArchiveCard } from '../../../shared/portfolio/archive-card';
import { PortfolioPeriod } from '../../../shared/portfolio/portfolio-period';

@Component({
  selector: 'app-job-item',
  imports: [
    ArchiveCard,
    ImageUrlPipe,
    RouterLink,
    PortfolioPeriod,
  ],
  templateUrl: './job-item.html',
  styleUrl: './job-item.scss',
})
export class JobItem {
  @Input({ required: true }) job!: Job;
}
