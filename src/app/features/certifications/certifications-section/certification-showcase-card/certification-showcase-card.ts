import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CertificationSummary } from '../../../../core/models/summary/certification';
import { HomeMetadataPills } from '../../../../shared/home-metadata-pills/home-metadata-pills';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url-pipe';

@Component({
  selector: 'app-certification-showcase-card',
  imports: [DatePipe, ImageUrlPipe, RouterLink, HomeMetadataPills],
  templateUrl: './certification-showcase-card.html',
  styleUrl: './certification-showcase-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificationShowcaseCard {
  readonly certification = input.required<CertificationSummary>();
  protected readonly failedThumbnail = signal<string | null>(null);
}
