import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Project } from '../../../core/models/project';
import { ApiState } from '../../../core/models/api.state';
import { Link } from '../../../shared/models/link';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';

@Component({
  selector: 'app-project-details-page',
  imports: [ImageUrlPipe, DecimalPipe, RouterLink, Header, Footer, DescriptionMd, ContactSection, LoadingDetailsPage],
  templateUrl: './project-details-page.html',
  styleUrl: './project-details-page.scss',
})
export class ProjectDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  constructor() {
    const state = this.route.snapshot.data['projectState'] as ApiState<Project>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.title}`);
      this.seoService.updateMeta(seo);
    }
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  project = toSignal(
    this.route.data.pipe(map(d => d['projectState'] as ApiState<Project>)),
    { initialValue: ApiState.loading<Project>() }
  );

  private readonly repoButtonLabel = $localize`:@@projectRepoButton:Project repository`;

  // Computed signal for better type narrowing in template
  projectData = computed(() => {
    const state = this.project();
    return state.status === 'success' ? state.data : null;
  });

  links = computed<Link[]>(() => {
    const projectState = this.project();

    if (projectState.status === 'success' && projectState.data.repoUrl) {
      return [{
        name: this.repoButtonLabel,
        url: projectState.data.repoUrl,
        mat_icon: 'commit'
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
