import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { EducationSummary } from '../../../core/models/summary/education';
import { EducationService } from '../../../core/services/education.service';
import { injectLazyMotion } from '../../../shared/animations/lazy-motion';
import { HomeMetadataPills } from '../../../shared/home-metadata-pills/home-metadata-pills';
import { HomeRailControls } from '../../../shared/home-rail-controls/home-rail-controls';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { SectionAction } from '../../../shared/section-action/section-action';
import { SectionFooter } from '../../../shared/section-footer/section-footer';

@Component({
  selector: 'app-education-section',
  imports: [DatePipe, RouterLink, ImageUrlPipe, SectionAction, SectionFooter, HomeMetadataPills, HomeRailControls],
  templateUrl: './education-section.html',
  styleUrl: './education-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationSection {
  private readonly educationService = inject(EducationService);

  protected readonly failedThumbnails = signal<ReadonlySet<string>>(new Set());

  readonly education = toSignal(this.educationService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<EducationSummary[]>(),
  });

  readonly entries = computed(() => {
    const state = this.education();
    return state.status === 'success' ? state.data : [];
  });

  constructor() {
    const mountMotion = injectLazyMotion();
    afterRenderEffect((onCleanup) => {
      if (this.entries().length === 0) {
        return;
      }

      // Cards reveal only after data, hydration, and fonts are ready.
      onCleanup(mountMotion(async (root) => {
        const [{ animateEducationCards }] = await Promise.all([
          import('./education-animation'), root.ownerDocument.fonts.ready,
        ]);
        return animateEducationCards;
      }, 'Education animation could not be loaded.'));
    });
  }

  protected hideThumbnail(thumbnail: string): void {
    this.failedThumbnails.update((failed) => new Set(failed).add(thumbnail));
  }
}
