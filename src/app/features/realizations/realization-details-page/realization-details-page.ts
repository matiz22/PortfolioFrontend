import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Realization } from '../../../core/models/realization';
import { map } from 'rxjs/operators';
import { Link } from '../../../shared/models/link';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { SkillsDetailsSection } from '../../skills/skills-details-section/skills-details-section';
import { TechnologiesDetailsSection } from '../../technologies/technologies-details-section/technologies-details-section';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';

@Component({
  selector: 'app-realization-details-page',
  imports: [ImageUrlPipe, RouterLink, Header, Footer, DescriptionMd, SkillsDetailsSection, TechnologiesDetailsSection, ContactSection, LoadingDetailsPage],
  templateUrl: './realization-details-page.html',
  styleUrl: './realization-details-page.scss',
})
export class RealizationDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  constructor() {
    const state = this.route.snapshot.data['realizationState'] as ApiState<Realization>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.title} | Mateusz Malich`);
      this.seoService.updateMeta(seo);
    }
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  realization = toSignal(
    this.route.data.pipe(map(d => d['realizationState'] as ApiState<Realization>)),
    { initialValue: ApiState.loading<Realization>() }
  );

  private readonly realizationData = computed(() => {
    const state = this.realization();
    return state.status === 'success' ? state.data : null;
  });

  private readonly clientButtonLabel = $localize`:@@clientButton:Client website`;
  links = computed<Link[]>(() => {
    const realizationState = this.realization();

    if (realizationState.status === 'success' && realizationState.data.clientUrl) {
      return [{
        name: this.clientButtonLabel,
        url: realizationState.data.clientUrl,
        mat_icon: 'contacts_product'
      }];
    }

    return [];
  });

  // Carousel drag functionality
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  onMouseDown(event: MouseEvent, carousel: HTMLElement): void {
    this.isDragging = true;
    carousel.classList.add('cursor-grabbing');
    this.startX = event.pageX - carousel.offsetLeft;
    this.scrollLeft = carousel.scrollLeft;
  }

  onMouseMove(event: MouseEvent, carousel: HTMLElement): void {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = event.pageX - carousel.offsetLeft;
    const walk = (x - this.startX) * 2; // Scroll speed multiplier
    carousel.scrollLeft = this.scrollLeft - walk;
  }

  onMouseUp(carousel: HTMLElement): void {
    this.isDragging = false;
    carousel.classList.remove('cursor-grabbing');
  }

  onMouseLeave(carousel: HTMLElement): void {
    this.isDragging = false;
    carousel.classList.remove('cursor-grabbing');
  }
}