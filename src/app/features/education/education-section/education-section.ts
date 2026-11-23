import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { EducationSummary } from '../../../core/models/summary/education';
import { EducationService } from '../../../core/services/education.service';
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
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  protected readonly failedThumbnails = signal<ReadonlySet<string>>(new Set());

  readonly education = toSignal(this.educationService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<EducationSummary[]>(),
  });

  readonly entries = computed(() => {
    const state = this.education();
    return state.status === 'success' ? state.data : [];
  });

  constructor() {
    afterRenderEffect((onCleanup) => {
      if (this.entries().length === 0) {
        return;
      }

      const root = this.element.nativeElement;
      let revert: (() => void) | undefined;
      let disposed = false;

      onCleanup(() => {
        disposed = true;
        revert?.();
      });

      // Cards reveal only after data, hydration, and fonts are ready.
      void Promise.all([
        import('./education-animation'),
        root.ownerDocument.fonts.ready,
      ]).then(([{ animateEducationCards }]) => {
        if (!disposed && !this.destroyRef.destroyed && root.isConnected) {
          this.zone.runOutsideAngular(() => {
            revert = animateEducationCards(root);
          });
        }
      }).catch((error: unknown) => {
        // All content is visible by default; motion is only an enhancement.
        console.warn('Education animation could not be loaded.', error);
      });
    });
  }

  protected hideThumbnail(thumbnail: string): void {
    this.failedThumbnails.update((failed) => new Set(failed).add(thumbnail));
  }
}
