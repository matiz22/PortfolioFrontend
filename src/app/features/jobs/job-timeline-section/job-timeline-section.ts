import { HomeCopy } from '../../../shared/animations/home-copy';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectLazyMotion } from '../../../shared/animations/lazy-motion';
import { map } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { JobsService } from '../../../core/services/jobs.service';
import { JobSummary } from '../../../core/models/summary/job';
import { HomeMetadataPills } from '../../../shared/home-metadata-pills/home-metadata-pills';
import { HomeRailControls } from '../../../shared/home-rail-controls/home-rail-controls';
import { SectionAction } from '../../../shared/section-action/section-action';
import { SectionFooter } from '../../../shared/section-footer/section-footer';

@Component({
  selector: 'app-job-timeline-section',
  imports: [HomeCopy, DatePipe, RouterLink, SectionAction, SectionFooter, HomeMetadataPills, HomeRailControls],
  templateUrl: './job-timeline-section.html',
  styleUrl: './job-timeline-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobTimelineSection {
  private readonly jobsService = inject(JobsService);

  readonly jobs = toSignal(this.jobsService.getHomeSummaryItems().pipe(
    map((state) => state.status === 'success'
      ? ApiState.success([...state.data].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()))
      : state),
  ), {
    initialValue: ApiState.loading<JobSummary[]>(),
  });

  constructor() {
    const mountMotion = injectLazyMotion();
    // API data and deferred hydration must finish rendering before measuring the track.
    afterRenderEffect((onCleanup) => {
      const state = this.jobs();
      if (state.status !== 'success' || state.data.length === 0) {
        return;
      }

      onCleanup(mountMotion(async (root) => {
        const [{ animateJobsTimeline }] = await Promise.all([
          import('./jobs-timeline-animation'), root.ownerDocument.fonts.ready,
        ]);
        return animateJobsTimeline;
      }, 'Experience animation could not be loaded.'));
    });
  }

  protected revealFocusedRole(event: FocusEvent): void {
    const target = event.target;
    const viewport = event.currentTarget;
    if (!(target instanceof HTMLElement) || !target.matches('.jobs-card:focus-visible') ||
      !(viewport instanceof HTMLElement) || viewport.scrollWidth <= viewport.clientWidth) {
      return;
    }

    const style = viewport.ownerDocument.defaultView?.getComputedStyle(viewport);
    if (style?.overflowX !== 'auto') {
      return; // The pinned desktop timeline has its own keyboard scroll handling.
    }

    const card = target.getBoundingClientRect();
    const bounds = viewport.getBoundingClientRect();
    if (card.left < bounds.left || card.right > bounds.right) {
      // The browser can consider a partly visible card already in view.
      const inset = parseFloat(style.scrollPaddingLeft) || 0;
      viewport.scrollBy({ left: card.left - bounds.left - inset, behavior: 'instant' });
    }
  }
}
