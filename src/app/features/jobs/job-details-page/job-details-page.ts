import {Component, inject} from '@angular/core';
import {ItemDetailsPage} from "../../../shared/showcase/item-details-page/item-details-page";
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {of, switchMap} from 'rxjs';
import {JobsService} from '../../../core/services/jobs.service';
import {ApiState} from '../../../core/models/api.state';
import {Job} from '../../../core/models/job';

@Component({
  selector: 'app-job-details-page',
  imports: [
    ItemDetailsPage
  ],
  templateUrl: './job-details-page.html',
  styleUrl: './job-details-page.scss'
})
export class JobDetailsPage {
  private readonly jobsService = inject(JobsService);
  private readonly route = inject(ActivatedRoute);
  job = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Job>('No job ID provided'));
        }
        return this.jobsService.getById(id);
      })
    ),
    {initialValue: ApiState.loading<Job>()}
  );
}
