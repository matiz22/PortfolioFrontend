import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { Education } from '../../../core/models/education';
import { EducationSummary } from '../../../core/models/summary/education';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { RouterLink } from '@angular/router';
import { ArchiveCard } from '../../../shared/portfolio/archive-card';
import { PortfolioPeriod } from '../../../shared/portfolio/portfolio-period';

@Component({
  selector: 'app-education-item',
  imports: [ArchiveCard, ImageUrlPipe, RouterLink, PortfolioPeriod],
  templateUrl: './education-item.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './education-item.scss',
})
export class EducationItem {
  @Input({ required: true }) education!: Education | EducationSummary;
  protected readonly failedThumbnail = signal<string | null>(null);
}
