import {Component, inject} from '@angular/core';
import {HeroSection} from '../../../shared/hero/hero-section/hero-section';
import {ProjectsService} from '../../../core/services/projects.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {Project} from '../../../core/models/project';
import {MatIconModule} from '@angular/material/icon';
import {ProjectItem} from '../project-item/project-item';

@Component({
  selector: 'app-project-list-page',
  imports: [
    HeroSection,
    MatIconModule,
    ProjectItem,
  ],
  templateUrl: './project-list-page.html',
  styleUrl: './project-list-page.scss'
})
export class ProjectListPage {
  cardTitle: string = `:@@homeTitle:Projects`;
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(this.projectService.getAll(), {initialValue: [] as Project[]});
}
