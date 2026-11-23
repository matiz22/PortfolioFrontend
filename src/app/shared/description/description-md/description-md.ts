import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';

@Component({
  selector: 'app-description-md',
  imports: [MarkdownComponent],
  providers: [provideMarkdown()],
  templateUrl: './description-md.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './description-md.scss',
})
export class DescriptionMd {
  description = input.required<string>();
  readonly showGlow = input(true);
}
