import { afterRenderEffect, Component, computed, ElementRef, inject, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Project } from '../../../core/models/project';
import { ApiState } from '../../../core/models/api.state';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';
import { GrainGradient } from '../../../shared/grain-gradient/grain-gradient';
import { CaseHeroCover } from '../../../shared/portfolio/case-hero-cover';
import { PortfolioGallery } from '../../../shared/portfolio/portfolio-gallery/portfolio-gallery';
import { animatePortfolioHero } from '../../../shared/portfolio/portfolio-hero-motion';
import { uniquePortfolioItems } from '../../../shared/portfolio/portfolio-metadata';

@Component({
  selector: 'app-project-details-page',
  imports: [
    ImageUrlPipe,
    RouterLink,
    Header,
    Footer,
    DescriptionMd,
    ContactSection,
    LoadingDetailsPage,
    GrainGradient,
    CaseHeroCover,
    PortfolioGallery,
  ],
  templateUrl: './project-details-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-details-page.scss',
})
export class ProjectDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  constructor() {
    const state = this.route.snapshot.data['projectState'] as ApiState<Project>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.title}`);
      this.seoService.updateMeta(seo);
    }

    afterRenderEffect((onCleanup) => {
      if (this.project().status !== 'success') return;

      const revert = this.zone.runOutsideAngular(() => animatePortfolioHero(this.element.nativeElement));
      onCleanup(() => this.zone.runOutsideAngular(revert));
    });
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  project = toSignal(
    this.route.data.pipe(map(d => d['projectState'] as ApiState<Project>)),
    { initialValue: ApiState.loading<Project>() }
  );

  protected readonly technologies = computed(() => {
    const state = this.project();
    return state.status === 'success' ? uniquePortfolioItems(state.data.technologies) : [];
  });
}
