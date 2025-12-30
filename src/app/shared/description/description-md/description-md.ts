import { Component, input } from '@angular/core';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';

@Component({
  selector: 'app-description-md',
  imports: [MarkdownComponent],
  providers: [provideMarkdown()],
  templateUrl: './description-md.html',
  styleUrl: './description-md.scss',
})
export class DescriptionMd {
  description = input.required<string>();
}

