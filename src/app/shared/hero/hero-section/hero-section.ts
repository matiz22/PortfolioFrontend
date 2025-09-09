import {Component, Input} from '@angular/core';
import {HeroCard} from '../hero-card/hero-card';

@Component({
  selector: 'app-hero-section',
  imports: [
    HeroCard
  ],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss'
})
export class HeroSection {
  @Input() cardTitle!: string;
  @Input() cardSubtitle?: string;
  @Input() cardImage!: string;
}
