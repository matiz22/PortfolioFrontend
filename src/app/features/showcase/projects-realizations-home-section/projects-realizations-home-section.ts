import { Component, inject } from '@angular/core';
import { AosAnimations } from '../../../shared/animations/aos-animation';
import { RouterLink } from '@angular/router';
import { RealizationItem } from '../../realizations/realization-item/realization-item';
import { ProjectItem } from '../../projects/project-item/project-item';
import { ProjectsService } from '../../../core/services/projects.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Project } from '../../../core/models/project';
import { ProjectSummary } from '../../../core/models/summary/project';
import { RealizationsService } from '../../../core/services/realizations.service';
import { Realization } from '../../../core/models/realization';
import { RealizationSummary } from '../../../core/models/summary/realization';

@Component({
  selector: 'app-projects-realizations-home-section',
  imports: [
    RouterLink,
    RealizationItem,
    ProjectItem,
    AosAnimations
  ],
  templateUrl: './projects-realizations-home-section.html',
  styleUrl: './projects-realizations-home-section.scss',
})
export class ProjectsRealizationsHomeSection {
  projectService: ProjectsService = inject(ProjectsService);
  projects = toSignal(
    this.projectService.getHomeSummaryItems(),
    {
      initialValue: ApiState.loading<ProjectSummary[]>()
    }
  );

  realizationsService: RealizationsService = inject(RealizationsService);
  realizations = toSignal(
    this.realizationsService.getHomeSummaryItems(),
    {
      initialValue: ApiState.loading<RealizationSummary[]>()
    }
  );
}
