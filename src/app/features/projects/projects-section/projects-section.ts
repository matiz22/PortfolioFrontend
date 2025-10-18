import {Component, inject} from '@angular/core';
import {ProjectsService} from '../../../core/services/projects.service';
import {Project} from '../../../core/models/project';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {ProjectItem} from '../project-item/project-item';
import {ApiState} from '../../../core/models/api.state';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';
import {NetworkError} from '../../../shared/errors/network-error/network-error';
import {NotFound} from '../../../shared/errors/not-found/not-found';

@Component({
  selector: 'app-projects-section',
  imports: [
    MatIconModule,
    RouterLink,
    MatButtonModule,
    ProjectItem,
    LoadingCircle,
    NetworkError,
    NotFound,
  ],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss'
})
export class ProjectsSection {
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(
    this.projectService.getHomeItems(),
    {
      initialValue: ApiState.loading<Project[]>()
    }
  );
}
