import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {JobsService} from '../../../core/services/jobs.service';
import {Job} from '../../../core/models/job';
import {MatIconModule} from '@angular/material/icon';
import {JobItem} from '../job-item/job-item';

@Component({
  selector: 'app-jobs-section',
  imports: [
    MatIconModule,
    JobItem
  ],
  templateUrl: './jobs-section.html',
  styleUrl: './jobs-section.scss'
})
export class JobsSection {
  jobsService: JobsService = inject(JobsService);
  jobs = toSignal(this.jobsService.getAll(), {initialValue: [] as Job[]});
}
