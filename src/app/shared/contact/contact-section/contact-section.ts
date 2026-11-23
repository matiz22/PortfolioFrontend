import { Component, input } from '@angular/core';
import { ContactForm } from "../contact-form/contact-form";
import { SocialLinksRow } from "../../../features/social-links/social-links-row/social-links-row";

@Component({
  selector: 'app-contact-section',
  imports: [ContactForm, SocialLinksRow],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
  host: { '[class.contact-glass]': 'glass()' },
})
export class ContactSection {
  readonly glass = input(false);
  readonly sectionId = input<string | null>('contact');
  readonly homeCopy = input(false);
}
