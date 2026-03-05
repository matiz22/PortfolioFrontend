import { Component, OnInit, computed, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { JobsService } from '../../../core/services/jobs.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Job } from '../../../core/models/job';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { JobItem } from '../job-item/job-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';
import { PaginationService } from '../../../shared/pagination/pagination.service';

@Component({
  selector: 'app-jobs-page',
  imports: [
    JobItem,
    Header,
    ContactSection,
    Footer,
    LoadingItems
  ],
  providers: [PaginationService],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
})
export class JobsPage implements OnInit {
  jobsService: JobsService = inject(JobsService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  protected pagination = inject(PaginationService);

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

  // Fetch paginated response based on current page
  jobsResponse = toSignal(
    toObservable(this.pagination.currentPage).pipe(
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

  currentPage = this.pagination.currentPage;
  paginationMeta = this.pagination.paginationMeta(this.jobsResponse);
  pageNumbers = this.pagination.pageNumbers(this.paginationMeta);
  goToPage = (page: number) => this.pagination.goToPage(page);
}
