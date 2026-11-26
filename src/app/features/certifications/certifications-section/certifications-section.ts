import { HomeCopy } from '../../../shared/animations/home-copy';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { injectLazyMotion } from '../../../shared/animations/lazy-motion';
import { CertificationsService } from '../../../core/services/certifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { CertificationSummary } from '../../../core/models/summary/certification';
import { RouterLink } from '@angular/router';
import { CertificationShowcaseCard } from './certification-showcase-card/certification-showcase-card';
import { HomeRailControls } from '../../../shared/home-rail-controls/home-rail-controls';
import { HomeStage } from '../../../shared/home-stage/home-stage';
import { SectionAction } from '../../../shared/section-action/section-action';
import { SectionFooter } from '../../../shared/section-footer/section-footer';
import { animateCertifications } from './certifications-animation';

@Component({
  selector: 'app-certifications-section',
  imports: [HomeCopy, CertificationShowcaseCard, RouterLink, HomeRailControls, HomeStage, SectionAction, SectionFooter],
  templateUrl: './certifications-section.html',
  styleUrl: './certifications-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificationsSection {
  private readonly certificationsService = inject(CertificationsService);

  readonly certifications = toSignal(this.certificationsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<CertificationSummary[]>(),
  });

  constructor() {
    const mountMotion = injectLazyMotion();
    // Browser-only, and repeated if asynchronous data replaces the document nodes.
    afterRenderEffect((onCleanup) => {
      const state = this.certifications();
      if (state.status !== 'success' || state.data.length === 0) {
        return;
      }

      onCleanup(mountMotion(async () => animateCertifications,
        'Certifications animation could not be loaded.'));
    });
  }
}
