import { Component, input, ViewEncapsulation } from '@angular/core';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';

@Component({
  selector: 'app-description-md',
  imports: [MarkdownComponent],
  providers: [provideMarkdown()],
  templateUrl: './description-md.html',
  // Markdown generates its descendants without Angular's scoping attributes.
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../../styles/markdown-prose.scss', './description-md.scss'],
})
export class DescriptionMd {
  description = input.required<string>();
  readonly showGlow = input(true);
}
