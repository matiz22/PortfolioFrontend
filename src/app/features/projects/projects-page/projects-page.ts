import { Component, inject } from '@angular/core';
import { ProjectsService } from '../../../core/services/projects.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Project } from '../../../core/models/project';
import { ProjectItem } from '../project-item/project-item';
import { Header } from '../../../shared/header/header';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-projects-page',
  imports: [
    ProjectItem,
    Header,
    ContactSection,
    Footer
  ],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
})
export class ProjectsPage {
  projectsService: ProjectsService = inject(ProjectsService);
  projects = toSignal(
    this.projectsService.getAll(),
    {
      initialValue: ApiState.loading<Project[]>()
    }
  );
}
