import { Component } from '@angular/core';
import { AosAnimations } from '../../../shared/animations/aos-animation';
import { CursorSpotlight } from '../../../shared/animations/cursor-spotlight';

@Component({
  selector: 'app-about-me-section',
  imports: [AosAnimations, CursorSpotlight],
  templateUrl: './about-me-section.html',
  styleUrl: './about-me-section.scss',
})
export class AboutMeSection {

}
