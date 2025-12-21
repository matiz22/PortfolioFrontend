import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ProjectsService } from '../../../core/services/projects.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { Project } from '../../../core/models/project';
import { ApiState } from '../../../core/models/api.state';
import { Link } from '../../../shared/models/link';

@Component({
  selector: 'app-project-details-page',
  imports: [ImageUrlPipe, RouterLink, Header, Footer],
  templateUrl: './project-details-page.html',
  styleUrl: './project-details-page.scss',
})
export class ProjectDetailsPage {
  private readonly projectService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);

  project = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Project>('No project ID provided'));
        }
        return this.projectService.getById(id);
      })
    ),
    { initialValue: ApiState.loading<Project>() }
  );

  private readonly repoButtonLabel = $localize`:@@projectRepoButton:Project repository`;

  // Computed signal for better type narrowing in template
  projectData = computed(() => {
    const state = this.project();
    return state.status === 'success' ? state.data : null;
  });

  links = computed<Link[]>(() => {
    const projectState = this.project();

    if (projectState.status === 'success' && projectState.data.repoUrl) {
      return [{
        name: this.repoButtonLabel,
        url: projectState.data.repoUrl,
        mat_icon: 'commit'
      }];
    }

    return [];
  });
}
