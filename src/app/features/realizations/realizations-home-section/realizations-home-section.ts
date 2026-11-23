import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterRenderEffect,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { gsap } from 'gsap';
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
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  private readonly realizationsService = inject(RealizationsService);
  readonly realizations = toSignal(this.realizationsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<RealizationSummary[]>(),
  });

  readonly hasItems = computed(() => {
    const state = this.realizations();
    return state.status === 'success' && state.data.length > 0;
  });

  constructor() {
    // Runs on the client after the realizations render, so the animation only
    // mounts once the showcase cards are actually in the DOM.
    afterRenderEffect((onCleanup) => {
      const state = this.realizations();
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
        import('./realizations-scroll-animation'),
        root.ownerDocument.fonts.ready,
      ])
        .then(([{ animateRealizationsScroll }]) => {
          if (!disposed && !this.destroyRef.destroyed && root.isConnected) {
            this.zone.runOutsideAngular(() => {
              motion = animateRealizationsScroll(root);
            });
          }
        })
        .catch((error: unknown) => {
          console.warn('Realizations scroll animation could not be loaded.', error);
        });
    });
  }
}
