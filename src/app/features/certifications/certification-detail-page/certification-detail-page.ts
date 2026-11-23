import { afterRenderEffect, Component, computed, ElementRef, inject, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Certification } from '../../../core/models/certification';
import { map } from 'rxjs/operators';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { DatePipe } from '@angular/common';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';
import { GrainGradient } from '../../../shared/grain-gradient/grain-gradient';
import { CaseHeroCover } from '../../../shared/portfolio/case-hero-cover';
import { animatePortfolioHero } from '../../../shared/portfolio/portfolio-hero-motion';
import { uniquePortfolioItems } from '../../../shared/portfolio/portfolio-metadata';

@Component({
  selector: 'app-certification-detail-page',
  imports: [
    ImageUrlPipe,
    RouterLink,
    Header,
    Footer,
    DescriptionMd,
    DatePipe,
    ContactSection,
    LoadingDetailsPage,
    GrainGradient,
    CaseHeroCover,
  ],
  templateUrl: './certification-detail-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './certification-detail-page.scss',
})
export class CertificationDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  constructor() {
    const state = this.route.snapshot.data['certificationState'] as ApiState<Certification>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.name}`);
      this.seoService.updateMeta(seo);
    }

    afterRenderEffect((onCleanup) => {
      if (this.certification().status !== 'success') return;

      const revert = this.zone.runOutsideAngular(() => animatePortfolioHero(this.element.nativeElement));
      onCleanup(() => this.zone.runOutsideAngular(revert));
    });
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  certification = toSignal(
    this.route.data.pipe(map(d => d['certificationState'] as ApiState<Certification>)),
    { initialValue: ApiState.loading<Certification>() }
  );

  protected readonly expertise = computed(() => {
    const state = this.certification();
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
