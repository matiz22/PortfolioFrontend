import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectLazyMotion } from '../../../shared/animations/lazy-motion';
import { RealizationsService } from '../../../core/services/realizations.service';
import { ApiState } from '../../../core/models/api.state';
import { RealizationSummary } from '../../../core/models/summary/realization';
import { RealizationShowcaseCard } from './realization-showcase-card/realization-showcase-card';
import { HomeRailControls } from '../../../shared/home-rail-controls/home-rail-controls';
import { SectionAction } from '../../../shared/section-action/section-action';
import { SectionFooter } from '../../../shared/section-footer/section-footer';

@Component({
  selector: 'app-realizations-home-section',
  imports: [RouterLink, RealizationShowcaseCard, HomeRailControls, SectionAction, SectionFooter],
  templateUrl: './realizations-home-section.html',
  styleUrl: './realizations-home-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RealizationsHomeSection {
  private readonly realizationsService = inject(RealizationsService);
  readonly realizations = toSignal(this.realizationsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<RealizationSummary[]>(),
  });

  private readonly controls = viewChild.required(HomeRailControls);

  constructor() {
    const mountMotion = injectLazyMotion();
    // Runs on the client after the realizations render, so the animation only
    // mounts once the showcase cards are actually in the DOM.
    afterRenderEffect((onCleanup) => {
      const state = this.realizations();
      if (state.status !== 'success' || state.data.length === 0) {
        return;
      }

      onCleanup(mountMotion(async (root) => {
        const [{ animateRealizationsScroll }] = await Promise.all([
          import('./realizations-scroll-animation'), root.ownerDocument.fonts.ready,
        ]);
        return (element) => animateRealizationsScroll(element,
          progress => this.controls().setPinnedProgress(progress));
      }, 'Realizations scroll animation could not be loaded.'));
    });
  }
}
