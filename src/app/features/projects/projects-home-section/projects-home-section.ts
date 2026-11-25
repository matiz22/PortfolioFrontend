import { HomeCopy } from '../../../shared/animations/home-copy';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectLazyMotion } from '../../../shared/animations/lazy-motion';
import { ProjectsService } from '../../../core/services/projects.service';
import { ApiState } from '../../../core/models/api.state';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ProjectPreview } from '../project-preview/project-preview';
import { HomeRailControls } from '../../../shared/home-rail-controls/home-rail-controls';
import { SectionAction } from '../../../shared/section-action/section-action';
import { SectionFooter } from '../../../shared/section-footer/section-footer';
import { StatusAnnouncer } from '../../../shared/status-announcer/status-announcer';

@Component({
  selector: 'app-projects-home-section',
  imports: [HomeCopy, RouterLink, ProjectPreview, HomeRailControls, SectionAction, SectionFooter, StatusAnnouncer],
  templateUrl: './projects-home-section.html',
  styleUrl: './projects-home-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsHomeSection {
  private readonly projectsService = inject(ProjectsService);
  readonly projects = toSignal(this.projectsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<ProjectSummary[]>(),
  });
  protected readonly statusMessage = computed(() => {
    const state = this.projects();
    if (state.status === 'loading') {
      return $localize`:@@projects.home.loading:Loading projects…`;
    }
    if (state.status === 'success' && state.data.length === 0) {
      return $localize`:@@projects.home.empty:No projects to show yet.`;
    }
    return '';
  });

  constructor() {
    const mountMotion = injectLazyMotion();
    // Runs on the client after the projects render, so the animation only
    // mounts once the project cards are actually in the DOM.
    afterRenderEffect((onCleanup) => {
      const state = this.projects();
      if (state.status !== 'success' || state.data.length === 0) {
        return;
      }

      onCleanup(mountMotion(async () => (await import('./projects-animation')).animateProjects,
        'Projects animation could not be loaded.'));
    });
  }
}
