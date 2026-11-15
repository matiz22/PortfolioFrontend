import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
} from '@angular/core';
import type { gsap } from 'gsap';
import { CertificationsService } from '../../../core/services/certifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { CertificationSummary } from '../../../core/models/summary/certification';
import { RouterLink } from '@angular/router';
import { CertificationShowcaseCard } from './certification-showcase-card/certification-showcase-card';

@Component({
  selector: 'app-certifications-section',
  imports: [CertificationShowcaseCard, RouterLink],
  templateUrl: './certifications-section.html',
  styleUrl: './certifications-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificationsSection {
  private readonly certificationsService = inject(CertificationsService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  readonly certifications = toSignal(this.certificationsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<CertificationSummary[]>(),
  });

  constructor() {
    // Browser-only, and repeated if asynchronous data replaces the document nodes.
    afterRenderEffect((onCleanup) => {
      const state = this.certifications();
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

      void import('./certifications-animation')
        .then(({ animateCertifications }) => {
          if (!disposed && !this.destroyRef.destroyed && root.isConnected) {
            this.zone.runOutsideAngular(() => {
              motion = animateCertifications(root);
            });
          }
        })
        .catch((error: unknown) => {
          // The document wall remains usable if the optional animation cannot load.
          console.warn('Certifications animation could not be loaded.', error);
        });
    });
  }
}
