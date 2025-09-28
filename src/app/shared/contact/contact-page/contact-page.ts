import {Component} from '@angular/core';
import {SocialLinks} from '../../footer/social-links/social-links';
import {HeroSection} from '../../hero/hero-section/hero-section';
import {ContactForm} from '../contact-form/contact-form';

@Component({
  selector: 'app-contact-page',
  imports: [
    SocialLinks,
    HeroSection,
    ContactForm
  ],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss'
})
export class ContactPage {

}
