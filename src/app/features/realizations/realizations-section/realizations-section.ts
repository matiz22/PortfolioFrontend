import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {RealizationsService} from '../../../core/services/realizations.service';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {Realization} from '../../../core/models/realization';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';

@Component({
  selector: 'app-realizations-section',
  imports: [
    MatIconModule,
    RouterLink,
    ItemCard,
    ImageUrlPipe,
    MatChip,
    MatChipAvatar,
    MatChipSet
  ],
  templateUrl: './realizations-section.html',
  styleUrl: './realizations-section.scss'
})
export class RealizationsSection {
  realizationsService: RealizationsService = inject(RealizationsService);
  realizations = toSignal(this.realizationsService.getAll(), {initialValue: [] as Realization[]});
}
