import {Component, computed, inject} from '@angular/core';
import {ItemDetailsPage} from '../../../shared/showcase/item-details-page/item-details-page';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {of, switchMap} from 'rxjs';
import {RealizationsService} from '../../../core/services/realizations.service';
import {MatIconModule} from '@angular/material/icon';
import {Link} from '../../../shared/models/link';

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
  private readonly clientButtonLabel = $localize`:@@clientButton:Client website`;

  private realizationsService: RealizationsService = inject(RealizationsService);
  private route: ActivatedRoute = inject(ActivatedRoute);

  realization = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return id ? this.realizationsService.getById(id) : of(null);
      })
    ),
    {initialValue: null}
  );

  links = computed<Link[]>(() => {
    const realization = this.realization();
    if (!realization?.clientUrl) return [];
    return [{
      name: this.clientButtonLabel,
      url: realization.clientUrl,
      mat_icon: 'contacts_product'
    }];
  });

}
