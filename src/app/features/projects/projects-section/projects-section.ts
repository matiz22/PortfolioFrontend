import {Component, inject} from '@angular/core';
import {ProjectService} from '../../../core/services/project.service';
import {Project} from '../../../core/models/project';
import {toSignal} from '@angular/core/rxjs-interop';
import {ProjectItem} from '../project-item/project-item';

@Component({
  selector: 'app-projects-section',
  imports: [
    ProjectItem
  ],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss'
})
export class ProjectsSection {
  projectService: ProjectService = inject(ProjectService);
  projects = toSignal(this.projectService.getHomeProjects(), {initialValue: [] as Project[]});

}
