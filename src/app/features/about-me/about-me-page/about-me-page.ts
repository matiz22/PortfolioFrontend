import {Component} from '@angular/core';
import {HeroSection} from '../../../shared/hero/hero-section/hero-section';

@Component({
  selector: 'app-about-me-page',
  imports: [
    HeroSection
  ],
  templateUrl: './about-me-page.html',
  styleUrl: './about-me-page.scss'
})
export class AboutMePage {

}
