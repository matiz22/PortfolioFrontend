import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { gsap } from 'gsap';
import { ApiState } from '../../../core/models/api.state';
import { JobsService } from '../../../core/services/jobs.service';
import { JobSummary } from '../../../core/models/summary/job';
import { SectionAction } from '../../../shared/section-action/section-action';
import { SectionFooter } from '../../../shared/section-footer/section-footer';

@Component({
  selector: 'app-job-timeline-section',
  imports: [DatePipe, RouterLink, SectionAction, SectionFooter],
  templateUrl: './job-timeline-section.html',
  styleUrl: './job-timeline-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobTimelineSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly jobsService = inject(JobsService);

  readonly jobs = toSignal(this.jobsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<JobSummary[]>(),
  });

  constructor() {
    // API data and deferred hydration must finish rendering before measuring the track.
    afterRenderEffect((onCleanup) => {
      const state = this.jobs();
      if (state.status !== 'success' || state.data.length === 0) {
        return;
      }

      const root = this.element.nativeElement;
      let motion: gsap.MatchMedia | undefined;
      let disposed = false;

      onCleanup(() => {
        disposed = true;
        motion?.revert();
      });

      void Promise.all([
        import('./jobs-timeline-animation'),
        root.ownerDocument.fonts.ready,
      ]).then(([{ animateJobsTimeline }]) => {
        if (!disposed && !this.destroyRef.destroyed && root.isConnected) {
          this.zone.runOutsideAngular(() => {
            motion = animateJobsTimeline(root);
          });
        }
      }).catch((error: unknown) => {
        console.warn('Experience animation could not be loaded.', error);
      });
    });
  }
}
