import {Component} from '@angular/core';
import {HeroSection} from '../../../shared/hero/hero-section/hero-section';
import {ContactSection} from '../../../shared/contact/contact-section/contact-section';

@Component({
  selector: 'app-about-me-page',
  imports: [
    HeroSection,
    ContactSection
  ],
  templateUrl: './about-me-page.html',
  styleUrl: './about-me-page.scss'
})
export class AboutMePage {

}
