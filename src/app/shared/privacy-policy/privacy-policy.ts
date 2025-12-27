import { Component, computed, inject, LOCALE_ID } from '@angular/core';
import { Header } from "../header/header";
import { ContactSection } from "../contact/contact-section/contact-section";
import { Footer } from "../footer/footer";
import { MarkdownComponent } from "ngx-markdown";

@Component({
  selector: 'app-privacy-policy',
  imports: [Header, ContactSection, Footer, MarkdownComponent],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  private locale = inject(LOCALE_ID);

  markdownPath = computed(() => {
    return this.locale.startsWith('pl')
      ? '/markdown/polityka-prywatnosc.md'
      : '/markdown/privacy-policy.md';
  });
}
