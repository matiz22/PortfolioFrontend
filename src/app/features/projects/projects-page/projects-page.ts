import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ProjectsService } from '../../../core/services/projects.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Project } from '../../../core/models/project';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { ProjectItem } from '../project-item/project-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';

@Component({
  selector: 'app-projects-page',
  imports: [
    ProjectItem,
    Header,
    ContactSection,
    Footer,
    LoadingItems
  ],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
})
export class ProjectsPage implements OnInit {
  projectsService: ProjectsService = inject(ProjectsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    const title = this.route.snapshot.title
      ?? $localize`:@@projectsTitleMeta:Projects | Mateusz Malich`;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({
      name: 'description',
      content: $localize`:@@projectsDescriptionMeta:Discover my portfolio of personal and professional projects showcasing my skills in web development, backend engineering, and AI integration.`
    });
  }

  // Reactive query param map that updates when route changes (even when component is reused)
  private queryParamMap = toSignal(this.route.queryParamMap);

  // Current page state derived from query params
  currentPage = computed(() => {
    const paramMap = this.queryParamMap();
    const pageParam = paramMap?.get('page');
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0) {
        return page;
      }
    }
    return 1;
  });

  // Fetch paginated response based on current page
  projectsResponse = toSignal(
    toObservable(this.currentPage).pipe(
      switchMap(page => this.projectsService.getAllPaginated(page))
    ),
    {
      initialValue: ApiState.loading<{ data: Project[], meta: PaginationMeta }>()
    }
  );

  // Extract just the projects from the paginated response
  projects = computed(() => {
    const response = this.projectsResponse();
    if (response.status === 'success') {
      return ApiState.success(response.data.data);
    }
    return response as ApiState<Project[]>;
  });

  // Extract pagination metadata
  paginationMeta = computed(() => {
    const response = this.projectsResponse();
    if (response.status === 'success') {
      return response.data.meta;
    }
    return null;
  });

  // Generate array of page numbers for pagination UI
  pageNumbers = computed(() => {
    const meta = this.paginationMeta();
    if (!meta) return [];
    return Array.from({ length: meta.lastPage }, (_, i) => i + 1);
  });

  // Navigate to a specific page
  goToPage(page: number): void {
    // Update URL query params - the currentPage computed signal will update automatically
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }
}
