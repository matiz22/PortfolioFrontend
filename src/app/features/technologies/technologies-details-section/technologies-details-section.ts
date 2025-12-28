import { Component, input } from '@angular/core';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Technology } from '../../../core/models/technology';

@Component({
  selector: 'app-technologies-details-section',
  imports: [ImageUrlPipe],
  templateUrl: './technologies-details-section.html',
  styleUrl: './technologies-details-section.scss',
})
export class TechnologiesDetailsSection {
  technologies = input<Technology[]>([]);
  title = input<string>($localize`:@@technologies.section.title:Technologies`);
}
