import {Component, inject} from '@angular/core';
import {HeroSection} from '../../../shared/hero/hero-section/hero-section';
import {ProjectsService} from '../../../core/services/projects.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {Project} from '../../../core/models/project';
import {MatIconModule} from '@angular/material/icon';
import {ProjectItem} from '../project-item/project-item';
import {ApiState} from '../../../core/models/api.state';
import {ContactSection} from '../../../shared/contact/contact-section/contact-section';
import {NotFound} from '../../../shared/errors/not-found/not-found';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';

@Component({
  selector: 'app-project-list-page',
  imports: [
    HeroSection,
    MatIconModule,
    ProjectItem,
    ContactSection,
    NotFound,
    LoadingCircle,
  ],
  templateUrl: './project-list-page.html',
  styleUrl: './project-list-page.scss'
})
export class ProjectListPage {
  cardTitle: string = $localize`:@@projectTitleListPage:Projects`;
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(
    this.projectService.getAll(),
    {
      initialValue: ApiState.loading<Project[]>()
    }
  );
}
