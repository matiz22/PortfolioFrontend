import { Component, OnInit, computed, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { EducationService } from '../../../core/services/education.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Education } from '../../../core/models/education';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { EducationItem } from '../education-item/education-item';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';
import { PaginationService } from '../../../shared/pagination/pagination.service';
import { PaginationTiles } from '../../../shared/pagination/pagination-tiles/pagination-tiles';

@Component({
  selector: 'app-education-page',
  imports: [Header, Footer, ContactSection, EducationItem, LoadingItems, PaginationTiles],
  providers: [PaginationService],
  templateUrl: './education-page.html',
  styleUrl: './education-page.scss',
})
export class EducationPage implements OnInit {
  educationService: EducationService = inject(EducationService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  protected pagination = inject(PaginationService);

  ngOnInit(): void {
    const title = this.route.snapshot.title
      ?? $localize`:@@educationTitleMeta:Education | Mateusz Malich`;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({
      name: 'description',
      content: $localize`:@@educationDescriptionMeta:Learn about my academic background, degrees, and studies in computer science and related fields that form the foundation of my technical knowledge.`
    });
  }

  // Fetch paginated response based on current page
  educationResponse = toSignal(
    toObservable(this.pagination.currentPage).pipe(
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

  currentPage = this.pagination.currentPage;
  paginationMeta = this.pagination.paginationMeta(this.educationResponse);
  pageNumbers = this.pagination.pageNumbers(this.paginationMeta);
  goToPage = (page: number) => this.pagination.goToPage(page);
}
