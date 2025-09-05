import {Component, inject} from '@angular/core';
import {ProjectsService} from '../../../core/services/projects.service';
import {Project} from '../../../core/models/project';
import {toSignal} from '@angular/core/rxjs-interop';
import {ProjectItem} from '../project-item/project-item';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {SectionTexts} from '../../../shared/sections/section-texts/section-texts';

@Component({
  selector: 'app-projects-section',
  imports: [
    ProjectItem,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    SectionTexts,
  ],
  templateUrl: './projects-section.html',
  styleUrl: './projects-section.scss'
})
export class ProjectsSection {
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(this.projectService.getHomeItems(), {initialValue: [] as Project[]});

}
