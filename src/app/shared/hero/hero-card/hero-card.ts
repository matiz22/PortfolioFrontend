import {Component, Input} from '@angular/core';
import {MatCard, MatCardSubtitle, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'hero-card',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
  ],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.scss'
})
export class HeroCard {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() image!: string;
}
