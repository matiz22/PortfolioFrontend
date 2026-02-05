import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificationsService } from '../../../core/services/certifications.service';
import { Certification } from '../../../core/models/certification';
import { ApiState } from '../../../core/models/api.state';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { CertificationItem } from '../certification-item/certification-item';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';

@Component({
  selector: 'app-certifications-page',
  imports: [Header, Footer, ContactSection, CertificationItem, LoadingItems],
  templateUrl: './certifications-page.html',
  styleUrl: './certifications-page.scss',
})
export class CertificationsPage implements OnInit {
  private certificationsService = inject(CertificationsService);
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
  certificationsResponse = toSignal(
    toObservable(this.currentPage).pipe(
      switchMap(page => this.certificationsService.getAllPaginated(page))
    ),
    {
      initialValue: ApiState.loading<{ data: Certification[], meta: PaginationMeta }>()
    }
  );

  // Extract just the certifications from the paginated response
  certifications = computed(() => {
    const response = this.certificationsResponse();
    if (response.status === 'success') {
      return ApiState.success(response.data.data);
    }
    return response as ApiState<Certification[]>;
  });

  // Extract pagination metadata
  paginationMeta = computed(() => {
    const response = this.certificationsResponse();
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
