import { Component } from '@angular/core';
import { ContactForm } from "../contact-form/contact-form";

@Component({
  selector: 'app-contact-section',
  imports: [ContactForm],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
})
export class ContactSection {

}
