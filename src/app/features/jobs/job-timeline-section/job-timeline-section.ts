import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { JobsService } from '../../../core/services/jobs.service';
import { Job } from '../../../core/models/job';
import { JobSummary } from '../../../core/models/summary/job';
import { AosAnimations } from '../../../shared/animations/aos-animation';

@Component({
  selector: 'app-job-timeline-section',
  imports: [DatePipe, RouterLink, AosAnimations],
  templateUrl: './job-timeline-section.html',
  styleUrl: './job-timeline-section.scss',
})
export class JobTimelineSection {
  jobsService: JobsService = inject(JobsService);
  jobs = toSignal(
    this.jobsService.getHomeSummaryItems(),
    {
      initialValue: ApiState.loading<JobSummary[]>()
    }
  );
}
