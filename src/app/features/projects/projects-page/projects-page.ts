import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { LoadingCard } from '../../../shared/loading/loading-card/loading-card';

@Component({
  selector: 'app-projects-page',
  imports: [
    ProjectItem,
    Header,
    ContactSection,
    Footer,
    LoadingCard
  ],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
})
export class ProjectsPage implements OnInit {
  projectsService: ProjectsService = inject(ProjectsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Current page state
  currentPage = signal(1);

  ngOnInit(): void {
    // Read page from URL query params on initialization
    const pageParam = this.route.snapshot.queryParamMap.get('page');
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0) {
        this.currentPage.set(page);
      }
    }
  }

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
    this.currentPage.set(page);
    // Update URL query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }
}
