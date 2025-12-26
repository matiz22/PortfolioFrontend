import { Component, input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-description-md',
  imports: [MarkdownComponent],
  templateUrl: './description-md.html',
  styleUrl: './description-md.scss',
})
export class DescriptionMd {
  description = input.required<string>();
}
