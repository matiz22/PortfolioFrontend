import { afterRenderEffect, Component, computed, ElementRef, inject, NgZone } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Realization } from '../../../core/models/realization';
import { map } from 'rxjs/operators';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';
import { GrainGradient } from '../../../shared/grain-gradient/grain-gradient';
import { PortfolioGallery } from '../../../shared/portfolio/portfolio-gallery/portfolio-gallery';
import { animatePortfolioHero } from '../../../shared/portfolio/portfolio-hero-motion';
import { uniquePortfolioItems } from '../../../shared/portfolio/portfolio-metadata';

@Component({
  selector: 'app-realization-details-page',
  imports: [
    ImageUrlPipe,
    RouterLink,
    Header,
    Footer,
    DescriptionMd,
    ContactSection,
    LoadingDetailsPage,
    GrainGradient,
    PortfolioGallery,
  ],
  templateUrl: './realization-details-page.html',
  styleUrl: './realization-details-page.scss',
})
export class RealizationDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  constructor() {
    const state = this.route.snapshot.data['realizationState'] as ApiState<Realization>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.title}`);
      this.seoService.updateMeta(seo);
    }

    // Load the motion with the lazy route so there is no extra request after render.
    afterRenderEffect((onCleanup) => {
      if (this.realization().status !== 'success') return;

      const revert = this.zone.runOutsideAngular(() => animatePortfolioHero(this.element.nativeElement));
      onCleanup(() => this.zone.runOutsideAngular(revert));
    });
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  realization = toSignal(
    this.route.data.pipe(map(d => d['realizationState'] as ApiState<Realization>)),
    { initialValue: ApiState.loading<Realization>() }
  );

  protected readonly expertise = computed(() => {
    const state = this.realization();
    if (state.status !== 'success') {
      return [];
    }

    const usedNames = new Set<string>();
    const stack = uniquePortfolioItems(state.data.technologies, usedNames);
    const skills = uniquePortfolioItems(state.data.skills, usedNames);
    return [
      { key: 'skills', label: $localize`:@@realizationDetails.skills.heading:Skills used`, items: skills },
      { key: 'stack', label: $localize`:@@portfolio.techStack:Tech stack`, items: stack },
    ].filter(({ items }) => items.length > 0);
  });
}
