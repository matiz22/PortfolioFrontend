import { Component, computed, inject, signal } from '@angular/core';
import { RealizationsService } from '../../../core/services/realizations.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Realization } from '../../../core/models/realization';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { RealizationItem } from '../realization-item/realization-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';

@Component({
  selector: 'app-realizations-page',
  imports: [
    RealizationItem,
    Header,
    ContactSection,
    Footer,
    LoadingItems
  ],
  templateUrl: './realizations-page.html',
  styleUrl: './realizations-page.scss',
})
export class RealizationsPage {
  realizationsService: RealizationsService = inject(RealizationsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
  realizationsResponse = toSignal(
    toObservable(this.currentPage).pipe(
      switchMap(page => this.realizationsService.getAllPaginated(page))
    ),
    {
      initialValue: ApiState.loading<{ data: Realization[], meta: PaginationMeta }>()
    }
  );

  // Extract just the realizations from the paginated response
  realizations = computed(() => {
    const response = this.realizationsResponse();
    if (response.status === 'success') {
      return ApiState.success(response.data.data);
    }
    return response as ApiState<Realization[]>;
  });

  // Extract pagination metadata
  paginationMeta = computed(() => {
    const response = this.realizationsResponse();
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
