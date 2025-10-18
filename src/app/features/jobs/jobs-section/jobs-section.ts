import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {JobsService} from '../../../core/services/jobs.service';
import {Job} from '../../../core/models/job';
import {MatIconModule} from '@angular/material/icon';
import {JobItem} from '../job-item/job-item';
import {ApiState} from '../../../core/models/api.state';
import {NotFound} from '../../../shared/errors/not-found/not-found';
import {NetworkError} from '../../../shared/errors/network-error/network-error';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';

@Component({
  selector: 'app-jobs-section',
  imports: [
    MatIconModule,
    JobItem,
    NotFound,
    NetworkError,
    LoadingCircle
  ],
  templateUrl: './jobs-section.html',
  styleUrl: './jobs-section.scss'
})
export class JobsSection {
  jobsService: JobsService = inject(JobsService);
  jobs = toSignal(
    this.jobsService.getHomeItems(),
    {
      initialValue: ApiState.loading<Job[]>()
    }
  );
}
