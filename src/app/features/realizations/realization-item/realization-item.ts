import {Component, Input} from '@angular/core';
import {ImageUrlPipe} from "../../../shared/pipes/image-url-pipe";
import {ItemCard} from "../../../shared/showcase/item-card/item-card";
import {MatChip, MatChipAvatar, MatChipSet} from "@angular/material/chips";
import {Realization} from '../../../core/models/realization';

@Component({
  selector: 'app-realization-item',
  imports: [
    ImageUrlPipe,
    ItemCard,
    MatChip,
    MatChipAvatar,
    MatChipSet
  ],
  templateUrl: './realization-item.html',
  styleUrl: './realization-item.scss'
})
export class RealizationItem {
  @Input() realization!: Realization;

}
