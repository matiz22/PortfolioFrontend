import {Component, computed, inject} from '@angular/core';
import {ItemDetailsPage} from '../../../shared/showcase/item-details-page/item-details-page';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {of, switchMap} from 'rxjs';
import {RealizationsService} from '../../../core/services/realizations.service';
import {MatIconModule} from '@angular/material/icon';
import {Link} from '../../../shared/models/link';
import {ApiState} from '../../../core/models/api.state';
import {Realization} from '../../../core/models/realization';

@Component({
  selector: 'app-realization-details-page',
  imports: [
    ItemDetailsPage,
    MatIconModule
  ],
  templateUrl: './realization-details-page.html',
  styleUrl: './realization-details-page.scss'
})
export class RealizationDetailsPage {
  private route: ActivatedRoute = inject(ActivatedRoute);

  realization = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Realization>('No realization ID provided'));
        }
        return this.realizationsService.getById(id);
      })
    ),
    {initialValue: ApiState.loading<Realization>()}
  );

  private realizationsService: RealizationsService = inject(RealizationsService);

  private readonly clientButtonLabel = `:@@clientButton:Client website`;
  links = computed<Link[]>(() => {
    const realizationState = this.realization();

    if (realizationState.status === 'success' && realizationState.data.clientUrl) {
      return [{
        name: this.clientButtonLabel,
        url: realizationState.data.clientUrl,
        mat_icon: 'contacts_product'
      }];
    }

    return [];
  });
}
