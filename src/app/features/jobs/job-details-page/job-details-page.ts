import {Component, inject} from '@angular/core';
import {ItemDetailsPage} from "../../../shared/showcase/item-details-page/item-details-page";
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {of, switchMap} from 'rxjs';
import {JobsService} from '../../../core/services/jobs.service';

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
      switchMap(params => params.get('id')
        ? this.jobsService.getById(params.get('id')!)
        : of(null)
      )
    ),
    {initialValue: null}
  );
}
