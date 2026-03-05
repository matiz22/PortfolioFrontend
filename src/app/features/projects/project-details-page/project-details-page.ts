import { Component, computed, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ProjectsService } from '../../../core/services/projects.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { Project } from '../../../core/models/project';
import { ApiState } from '../../../core/models/api.state';
import { Link } from '../../../shared/models/link';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { TechnologiesDetailsSection } from '../../technologies/technologies-details-section/technologies-details-section';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';

@Component({
  selector: 'app-project-details-page',
  imports: [ImageUrlPipe, RouterLink, Header, Footer, DescriptionMd, TechnologiesDetailsSection, ContactSection, LoadingDetailsPage],
  templateUrl: './project-details-page.html',
  styleUrl: './project-details-page.scss',
})
export class ProjectDetailsPage {
  private readonly projectService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);

  project = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Project>('No project ID provided'));
        }
        return this.projectService.getById(id);
      })
    ),
    { initialValue: ApiState.loading<Project>() }
  );

  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  constructor() {
    effect(() => {
      const state = this.project();
      if (state.status === 'success') {
        this.titleService.setTitle(`${state.data.title} | Mateusz Malich`);
        this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
      }
    });
  }

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
