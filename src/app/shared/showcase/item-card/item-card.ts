import {Component, Input} from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatRippleModule} from '@angular/material/core';
import {ImageUrlPipe} from '../../pipes/image-url-pipe';
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
    MatCardFooter,
    RouterLink,
    MatCardSubtitle
  ],
  templateUrl: './item-card.html',
  styleUrl: './item-card.scss'
})
export class ItemCard {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() thumbnail?: string | null;
  @Input() routerLink?: any[];
}
