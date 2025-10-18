import {Component, inject} from '@angular/core';
import {ItemDetailsPage} from '../../../shared/showcase/item-details-page/item-details-page';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {of, switchMap} from 'rxjs';
import {EducationService} from '../../../core/services/education.service';
import {ApiState} from '../../../core/models/api.state';
import {Education} from '../../../core/models/education';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';
import {NetworkError} from '../../../shared/errors/network-error/network-error';

@Component({
  selector: 'app-education-details-page',
  imports: [
    ItemDetailsPage,
    LoadingCircle,
    NetworkError
  ],
  templateUrl: './education-details-page.html',
  styleUrl: './education-details-page.scss'
})
export class EducationDetailsPage {
  private readonly educationService = inject(EducationService);
  private readonly route = inject(ActivatedRoute);
  education = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Education>('No certification ID provided'));
        }
        return this.educationService.getById(id);
      })
    ),
    {initialValue: ApiState.loading<Education>()}
  );
}
