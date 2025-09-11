import {Component} from '@angular/core';
import {SectionTexts} from '../../sections/section-texts/section-texts';
import {ContactForm} from '../contact-form/contact-form';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-contact-section',
  imports: [
    SectionTexts,
    ContactForm,
    MatDivider
  ],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss'
})
export class ContactSection {

}
