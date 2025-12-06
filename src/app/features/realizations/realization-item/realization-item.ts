import {Component, Input} from '@angular/core';
import {Realization} from '../../../core/models/realization';
import {ImageUrlPipe} from '../../../shared/pipes/image-url-pipe';


@Component({
  selector: 'app-realization-item',
  imports: [
    ImageUrlPipe
  ],
  templateUrl: './realization-item.html',
  styleUrl: './realization-item.scss',
})
export class RealizationItem {
  @Input({required: true}) realization!: Realization;

  // derived helpers for template
  get year(): number | null {
    const date = this.realization?.createdAt;
    return date ? new Date(date).getFullYear() : null;
  }

  get summary(): string {
    return this.realization?.shortDesc || this.realization?.description || '';
  }

  get techList() {
    return this.realization?.technologies || [];
  }

  get clientUrl(): string | undefined {
    return this.realization?.clientUrl || undefined;
  }
}
