import {Component, computed, inject} from '@angular/core';
import {ProjectsService} from '../../../core/services/projects.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {of, switchMap} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ItemDetailsPage} from '../../../shared/showcase/item-details-page/item-details-page';
import {Link} from '../../../shared/models/link';
import {Project} from '../../../core/models/project';
import {ApiState} from '../../../core/models/api.state';

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    ItemDetailsPage
  ],
  templateUrl: './project-details-page.html',
  styleUrl: './project-details-page.scss'
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
    {initialValue: ApiState.loading<Project>()}
  );

  private readonly repoButtonLabel = `:@@projectRepoButton:Project repository`;

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
