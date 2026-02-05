import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { LoadingCard } from '../../../shared/loading/loading-card/loading-card';

@Component({
  selector: 'app-jobs-page',
  imports: [
    JobItem,
    Header,
    ContactSection,
    Footer,
    LoadingCard
  ],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
})
export class JobsPage implements OnInit {
  jobsService: JobsService = inject(JobsService);
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
    this.currentPage.set(page);
    // Update URL query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }
}
