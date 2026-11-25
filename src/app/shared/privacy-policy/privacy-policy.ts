import { Component, computed, inject, LOCALE_ID, ViewEncapsulation } from '@angular/core';
import { Header } from "../header/header";
import { ContactSection } from "../contact/contact-section/contact-section";
import { Footer } from "../footer/footer";
import { MarkdownComponent, provideMarkdown } from "ngx-markdown";

@Component({
  selector: 'app-privacy-policy',
  imports: [Header, ContactSection, Footer, MarkdownComponent],
  providers: [provideMarkdown()],
  templateUrl: './privacy-policy.html',
  // The shared stylesheet is scoped by class so it also reaches generated Markdown.
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../styles/markdown-prose.scss',
})
export class PrivacyPolicy {
  private locale = inject(LOCALE_ID);

  markdownPath = computed(() => {
    return this.locale.startsWith('pl')
      ? '/markdown/polityka-prywatnosc.md'
      : '/markdown/privacy-policy.md';
  });
}
