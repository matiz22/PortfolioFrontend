import {Component, computed, inject} from '@angular/core';
import {ProjectsService} from '../../../core/services/projects.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {of, switchMap} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ItemDetailsPage} from '../../../shared/showcase/item-details-page/item-details-page';
import {Link} from '../../../shared/models/link';

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
      switchMap(params => params.get('id')
        ? this.projectService.getById(params.get('id')!)
        : of(null)
      )
    ),
    {initialValue: null}
  );
  private readonly repoButtonLabel = $localize`:@@projectRepoButton:Project repository`;
  links = computed<Link[]>(() => {
    const project = this.project();
    if (!project?.repoUrl) return [];
    return [{
      name: this.repoButtonLabel,
      url: project.repoUrl,
      mat_icon: 'commit'
    }];
  });

}
