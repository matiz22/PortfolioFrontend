import { Component, Input } from '@angular/core';
import { Realization } from '../../../core/models/realization';
import { RealizationSummary } from '../../../core/models/summary/realization';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { RouterLink } from '@angular/router';
import { ArchiveCard } from '../../../shared/portfolio/archive-card';

@Component({
  selector: 'app-realization-item',
  imports: [
    ArchiveCard,
    ImageUrlPipe,
    RouterLink
  ],
  templateUrl: './realization-item.html',
  styleUrl: './realization-item.scss',
})
export class RealizationItem {
  @Input({ required: true }) realization!: Realization | RealizationSummary;

  // derived helpers for template
  get year(): number | null {
    const item = this.realization;
    const date = item && 'createdAt' in item ? item.createdAt : undefined;
    return date ? new Date(date).getFullYear() : null;
  }

  get summary(): string {
    return this.realization?.shortDesc || '';
  }

  get techList() {
    return this.realization?.technologies || [];
  }

  get clientUrl(): string | undefined {
    return this.realization?.clientUrl || undefined;
  }
}
