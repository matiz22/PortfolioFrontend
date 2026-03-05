import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { JobsService } from '../../../core/services/jobs.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Job } from '../../../core/models/job';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { JobItem } from '../job-item/job-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';

@Component({
  selector: 'app-jobs-page',
  imports: [
    JobItem,
    Header,
    ContactSection,
    Footer,
    LoadingItems
  ],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
})
export class JobsPage implements OnInit {
  jobsService: JobsService = inject(JobsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    const title = this.route.snapshot.title
      ?? $localize`:@@jobsTitleMeta:Experience | Mateusz Malich`;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({
      name: 'description',
      content: $localize`:@@jobsDescriptionMeta:Explore my professional background and work experience in software engineering, including roles, responsibilities, and key achievements.`
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
  jobsResponse = toSignal(
    toObservable(this.currentPage).pipe(
      switchMap(page => this.jobsService.getAllPaginated(page))
    ),
    {
      initialValue: ApiState.loading<{ data: Job[], meta: PaginationMeta }>()
    }
  );

  // Extract just the jobs from the paginated response
  jobs = computed(() => {
    const response = this.jobsResponse();
    if (response.status === 'success') {
      return ApiState.success(response.data.data);
    }
    return response as ApiState<Job[]>;
  });

  // Extract pagination metadata
  paginationMeta = computed(() => {
    const response = this.jobsResponse();
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
