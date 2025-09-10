import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {RealizationsService} from '../../../core/services/realizations.service';
import {MatIconModule} from '@angular/material/icon';
import {Realization} from '../../../core/models/realization';
import {RealizationItem} from '../realization-item/realization-item';

@Component({
  selector: 'app-realizations-section',
  imports: [
    MatIconModule,
    RealizationItem
  ],
  templateUrl: './realizations-section.html',
  styleUrl: './realizations-section.scss'
})
export class RealizationsSection {
  realizationsService: RealizationsService = inject(RealizationsService);
  realizations = toSignal(this.realizationsService.getHomeItems(), {initialValue: [] as Realization[]});
}
