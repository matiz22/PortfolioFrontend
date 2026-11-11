import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterRenderEffect,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { gsap } from 'gsap';
import { ProjectsService } from '../../../core/services/projects.service';
import { ApiState } from '../../../core/models/api.state';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ProjectItem } from '../project-item/project-item';

@Component({
  selector: 'app-projects-home-section',
  imports: [RouterLink, ProjectItem],
  templateUrl: './projects-home-section.html',
  styleUrl: './projects-home-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsHomeSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  private readonly projectsService = inject(ProjectsService);
  readonly projects = toSignal(this.projectsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<ProjectSummary[]>(),
  });

  readonly skeletons = [0, 1, 2];

  constructor() {
    // Runs on the client after the projects render, so the animation only
    // mounts once the project cards are actually in the DOM.
    afterRenderEffect((onCleanup) => {
      const state = this.projects();
      if (state.status !== 'success' || state.data.length === 0) {
        return;
      }

      const root = this.element.nativeElement;
      let motion: gsap.MatchMedia | undefined;
      let disposed = false;

      onCleanup(() => {
        disposed = true;
        motion?.revert();
      });

      void Promise.all([
        import('./projects-scroll-animation'),
        root.ownerDocument.fonts.ready,
      ])
        .then(([{ animateProjectsScroll }]) => {
          if (!disposed && !this.destroyRef.destroyed && root.isConnected) {
            this.zone.runOutsideAngular(() => {
              motion = animateProjectsScroll(root);
            });
          }
        })
        .catch((error: unknown) => {
          console.warn('Projects scroll animation could not be loaded.', error);
        });
    });
  }
}
