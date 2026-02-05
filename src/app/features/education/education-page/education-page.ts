import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { EducationService } from '../../../core/services/education.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Education } from '../../../core/models/education';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { EducationItem } from '../education-item/education-item';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';

@Component({
  selector: 'app-education-page',
  imports: [Header, Footer, ContactSection, EducationItem, LoadingItems],
  templateUrl: './education-page.html',
  styleUrl: './education-page.scss',
})
export class EducationPage implements OnInit {
  educationService: EducationService = inject(EducationService);
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
  educationResponse = toSignal(
    toObservable(this.currentPage).pipe(
      switchMap(page => this.educationService.getAllPaginated(page))
    ),
    {
      initialValue: ApiState.loading<{ data: Education[], meta: PaginationMeta }>()
    }
  );

  // Extract just the education from the paginated response
  education = computed(() => {
    const response = this.educationResponse();
    if (response.status === 'success') {
      return ApiState.success(response.data.data);
    }
    return response as ApiState<Education[]>;
  });

  // Extract pagination metadata
  paginationMeta = computed(() => {
    const response = this.educationResponse();
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
