import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { CertificationsService } from '../../../core/services/certifications.service';
import { Certification } from '../../../core/models/certification';
import { ApiState } from '../../../core/models/api.state';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { CertificationItem } from '../certification-item/certification-item';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';
import { PaginationService } from '../../../shared/pagination/pagination.service';
import { PaginationTiles } from '../../../shared/pagination/pagination-tiles/pagination-tiles';
import { GrainGradient } from '../../../shared/grain-gradient/grain-gradient';

@Component({
  selector: 'app-certifications-page',
  imports: [Header, Footer, ContactSection, CertificationItem, LoadingItems, PaginationTiles, GrainGradient],
  providers: [PaginationService],
  templateUrl: './certifications-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './certifications-page.scss',
})
export class CertificationsPage {
  private certificationsService = inject(CertificationsService);
  protected pagination = inject(PaginationService);

  // Fetch paginated response based on current page
  certificationsResponse = toSignal(
    toObservable(this.pagination.currentPage).pipe(
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

  currentPage = this.pagination.currentPage;
  paginationMeta = this.pagination.paginationMeta(this.certificationsResponse);
  pageNumbers = this.pagination.pageNumbers(this.paginationMeta);
  goToPage = (page: number) => this.pagination.goToPage(page);
}
