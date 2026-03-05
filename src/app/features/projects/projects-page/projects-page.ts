import { Component, OnInit, computed, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ProjectsService } from '../../../core/services/projects.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ApiState } from '../../../core/models/api.state';
import { Project } from '../../../core/models/project';
import { PaginationMeta } from '../../../core/models/pagination-meta';
import { ProjectItem } from '../project-item/project-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';
import { LoadingItems } from '../../../shared/loading/loading-items/loading-items';
import { PaginationService } from '../../../shared/pagination/pagination.service';

@Component({
  selector: 'app-projects-page',
  imports: [
    ProjectItem,
    Header,
    ContactSection,
    Footer,
    LoadingItems
  ],
  providers: [PaginationService],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
})
export class ProjectsPage implements OnInit {
  projectsService: ProjectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  protected pagination = inject(PaginationService);

  ngOnInit(): void {
    const title = this.route.snapshot.title
      ?? $localize`:@@projectsTitleMeta:Projects | Mateusz Malich`;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({
      name: 'description',
      content: $localize`:@@projectsDescriptionMeta:Discover my portfolio of personal and professional projects showcasing my skills in web development, backend engineering, and AI integration.`
    });
  }

  // Fetch paginated response based on current page
  projectsResponse = toSignal(
    toObservable(this.pagination.currentPage).pipe(
      switchMap(page => this.projectsService.getAllPaginated(page))
    ),
    {
      initialValue: ApiState.loading<{ data: Project[], meta: PaginationMeta }>()
    }
  );

  // Extract just the projects from the paginated response
  projects = computed(() => {
    const response = this.projectsResponse();
    if (response.status === 'success') {
      return ApiState.success(response.data.data);
    }
    return response as ApiState<Project[]>;
  });

  currentPage = this.pagination.currentPage;
  paginationMeta = this.pagination.paginationMeta(this.projectsResponse);
  pageNumbers = this.pagination.pageNumbers(this.paginationMeta);
  goToPage = (page: number) => this.pagination.goToPage(page);
}
