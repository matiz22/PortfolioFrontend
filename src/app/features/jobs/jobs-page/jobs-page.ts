import { Component, inject } from '@angular/core';
import { JobsService } from '../../../core/services/jobs.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Job } from '../../../core/models/job';
import { JobItem } from '../job-item/job-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-jobs-page',
  imports: [
    JobItem,
    Header,
    ContactSection,
    Footer
  ],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
})
export class JobsPage {
  jobsService: JobsService = inject(JobsService);
  jobs = toSignal(
    this.jobsService.getAll(),
    {
      initialValue: ApiState.loading<Job[]>()
    }
  );
}
