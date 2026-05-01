import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Certification } from '../../../core/models/certification';
import { map } from 'rxjs/operators';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { SkillsDetailsSection } from '../../skills/skills-details-section/skills-details-section';
import { TechnologiesDetailsSection } from '../../technologies/technologies-details-section/technologies-details-section';
import { DatePipe } from '@angular/common';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';

@Component({
  selector: 'app-certification-detail-page',
  imports: [
    ImageUrlPipe,
    RouterLink,
    Header,
    Footer,
    DescriptionMd,
    SkillsDetailsSection,
    TechnologiesDetailsSection,
    DatePipe,
    ContactSection,
    LoadingDetailsPage
  ],
  templateUrl: './certification-detail-page.html',
  styleUrl: './certification-detail-page.scss',
})
export class CertificationDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  constructor() {
    const state = this.route.snapshot.data['certificationState'] as ApiState<Certification>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.name} | Mateusz Malich`);
      this.seoService.updateMeta(seo);
    }
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  certification = toSignal(
    this.route.data.pipe(map(d => d['certificationState'] as ApiState<Certification>)),
    { initialValue: ApiState.loading<Certification>() }
  );

  private readonly certificationData = computed(() => {
    const state = this.certification();
    return state.status === 'success' ? state.data : null;
  });
}
