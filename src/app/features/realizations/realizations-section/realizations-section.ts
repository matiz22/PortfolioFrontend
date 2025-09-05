import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {RealizationsService} from '../../../core/services/realizations.service';
import {SectionTexts} from '../../../shared/sections/section-texts/section-texts';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {Realization} from '../../../core/models/realization';
import {ItemCard} from '../../../shared/showcase/item-card/item-card';
import {mapSkillToChip} from '../../../shared/showcase/item-card/mappers/skills.to.chips';
import {mapTechnologyToChip} from '../../../shared/showcase/item-card/mappers/technologies.to.chips';

@Component({
  selector: 'app-realizations-section',
  imports: [
    SectionTexts,
    MatIconModule,
    RouterLink,
    ItemCard
  ],
  templateUrl: './realizations-section.html',
  styleUrl: './realizations-section.scss'
})
export class RealizationsSection {
  realizationsService: RealizationsService = inject(RealizationsService);
  realizations = toSignal(this.realizationsService.getAll(), {initialValue: [] as Realization[]});
  protected readonly mapSkillToChip = mapSkillToChip;
  protected readonly mapTechnologyToChip = mapTechnologyToChip;
}
