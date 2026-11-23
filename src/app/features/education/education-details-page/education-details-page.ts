import { afterRenderEffect, Component, computed, ElementRef, inject, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { Education } from '../../../core/models/education';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';
import { GrainGradient } from '../../../shared/grain-gradient/grain-gradient';
import { CaseHeroCover } from '../../../shared/portfolio/case-hero-cover';
import { animatePortfolioHero } from '../../../shared/portfolio/portfolio-hero-motion';
import { uniquePortfolioItems } from '../../../shared/portfolio/portfolio-metadata';
import { PortfolioPeriod } from '../../../shared/portfolio/portfolio-period';

@Component({
  selector: 'app-education-details-page',
  imports: [
    Header,
    Footer,
    RouterLink,
    ImageUrlPipe,
    PortfolioPeriod,
    DescriptionMd,
    ContactSection,
    LoadingDetailsPage,
    GrainGradient,
    CaseHeroCover,
  ],
  templateUrl: './education-details-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './education-details-page.scss'
})
export class EducationDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  constructor() {
    const state = this.route.snapshot.data['educationState'] as ApiState<Education>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.degree} at ${state.data.institution}`);
      this.seoService.updateMeta(seo);
    }

    afterRenderEffect((onCleanup) => {
      if (this.education().status !== 'success') return;

      const revert = this.zone.runOutsideAngular(() => animatePortfolioHero(this.element.nativeElement));
      onCleanup(() => this.zone.runOutsideAngular(revert));
    });
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  education = toSignal(
    this.route.data.pipe(map(d => d['educationState'] as ApiState<Education>)),
    { initialValue: ApiState.loading<Education>() }
  );

  protected readonly expertise = computed(() => {
    const state = this.education();
    if (state.status !== 'success') return [];

    const usedNames = new Set<string>();
    const stack = uniquePortfolioItems(state.data.technologies, usedNames);
    const skills = uniquePortfolioItems(state.data.skills, usedNames);
    return [
      { key: 'skills', label: $localize`:@@home.metadata.skills:Skills`, items: skills },
      { key: 'stack', label: $localize`:@@portfolio.techStack:Tech stack`, items: stack },
    ].filter(({ items }) => items.length > 0);
  });
}
