import {Component, Input} from '@angular/core';
import {Chip} from './models/chip';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardTitle
} from '@angular/material/card';
import {MatRippleModule} from '@angular/material/core';
import {ImageUrlPipe} from '../../pipes/image-url-pipe';
import {MatChip, MatChipAvatar, MatChipSet} from '@angular/material/chips';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-item-card',
  imports: [
    MatCard,
    MatRippleModule,
    ImageUrlPipe,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardImage,
    MatChipSet,
    MatChip,
    MatChipAvatar,
    MatCardFooter,
    RouterLink
  ],
  templateUrl: './item-card.html',
  styleUrl: './item-card.scss'
})
export class ItemCard {
  @Input() title!: string;
  @Input() description?: string;
  @Input() thumbnail?: string | null;
  @Input() routerLink?: any[];

  @Input() chipSets: { type: string, chips: Chip[]; }[] = [];
}
