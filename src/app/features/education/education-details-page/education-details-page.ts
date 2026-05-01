import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { Education } from '../../../core/models/education';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { DatePipe } from '@angular/common';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { SkillsDetailsSection } from '../../skills/skills-details-section/skills-details-section';
import { TechnologiesDetailsSection } from '../../technologies/technologies-details-section/technologies-details-section';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';


@Component({
  selector: 'app-education-details-page',
  imports: [
    Header,
    Footer,
    RouterLink,
    ImageUrlPipe,
    DatePipe,
    DescriptionMd,
    SkillsDetailsSection,
    TechnologiesDetailsSection,
    ContactSection,
    LoadingDetailsPage
  ],
  templateUrl: './education-details-page.html',
  styleUrl: './education-details-page.scss'
})
export class EducationDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  constructor() {
    const state = this.route.snapshot.data['educationState'] as ApiState<Education>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.degree} at ${state.data.institution} | Mateusz Malich`);
      this.seoService.updateMeta(seo);
    }
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  education = toSignal(
    this.route.data.pipe(map(d => d['educationState'] as ApiState<Education>)),
    { initialValue: ApiState.loading<Education>() }
  );

  private readonly educationData = computed(() => {
    const state = this.education();
    return state.status === 'success' ? state.data : null;
  });
}