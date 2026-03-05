import { Component, OnInit, computed, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RealizationsService } from '../../../core/services/realizations.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Realization } from '../../../core/models/realization';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { RealizationItem } from '../realization-item/realization-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';
import { PaginationService } from '../../../shared/pagination/pagination.service';

@Component({
  selector: 'app-realizations-page',
  imports: [
    RealizationItem,
    Header,
    ContactSection,
    Footer,
    LoadingItems
  ],
  providers: [PaginationService],
  templateUrl: './realizations-page.html',
  styleUrl: './realizations-page.scss',
})
export class RealizationsPage implements OnInit {
  realizationsService: RealizationsService = inject(RealizationsService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  protected pagination = inject(PaginationService);

  ngOnInit(): void {
    const title = this.route.snapshot.title
      ?? $localize`:@@realizationsTitleMeta:Realizations | Mateusz Malich`;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({
      name: 'description',
      content: $localize`:@@realizationsDescriptionMeta:View a collection of successful client projects, freelance work, and commercial applications I have delivered.`
    });
  }

  // Fetch paginated response based on current page
  realizationsResponse = toSignal(
    toObservable(this.pagination.currentPage).pipe(
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

  currentPage = this.pagination.currentPage;
  paginationMeta = this.pagination.paginationMeta(this.realizationsResponse);
  pageNumbers = this.pagination.pageNumbers(this.paginationMeta);
  goToPage = (page: number) => this.pagination.goToPage(page);
}
