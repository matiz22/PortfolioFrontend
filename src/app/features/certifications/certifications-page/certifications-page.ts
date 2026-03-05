import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    const title = this.route.snapshot.title
      ?? $localize`:@@certificationsTitleMeta:Certifications | Mateusz Malich`;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({
      name: 'description',
      content: $localize`:@@certificationsDescriptionMeta:Review my professional certifications and continuous learning achievements in various technologies and methodologies.`
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
    // Update URL query params - the currentPage computed signal will update automatically
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }
}
