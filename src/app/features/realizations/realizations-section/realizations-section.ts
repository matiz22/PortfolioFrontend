import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {RealizationsService} from '../../../core/services/realizations.service';
import {MatIconModule} from '@angular/material/icon';
import {Realization} from '../../../core/models/realization';
import {RealizationItem} from '../realization-item/realization-item';
import {ApiState} from '../../../core/models/api.state';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';
import {NotFound} from '../../../shared/errors/not-found/not-found';
import {NetworkError} from '../../../shared/errors/network-error/network-error';

@Component({
  selector: 'app-realizations-section',
  imports: [
    MatIconModule,
    RealizationItem,
    LoadingCircle,
    NotFound,
    NetworkError
  ],
  templateUrl: './realizations-section.html',
  styleUrl: './realizations-section.scss'
})
export class RealizationsSection {
  realizationsService: RealizationsService = inject(RealizationsService);
  realizations = toSignal(
    this.realizationsService.getHomeItems(),
    {
      initialValue: ApiState.loading<Realization[]>()
    }
  );
}
