import { Component, OnInit, computed, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'app-certifications-page',
  imports: [Header, Footer, ContactSection, CertificationItem, LoadingItems, PaginationTiles],
  providers: [PaginationService],
  templateUrl: './certifications-page.html',
  styleUrl: './certifications-page.scss',
})
export class CertificationsPage implements OnInit {
  private certificationsService = inject(CertificationsService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  protected pagination = inject(PaginationService);

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
