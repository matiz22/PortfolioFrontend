import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectLazyMotion } from '../../../shared/animations/lazy-motion';
import { ProjectsService } from '../../../core/services/projects.service';
import { ApiState } from '../../../core/models/api.state';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ProjectPreview } from '../project-preview/project-preview';
import { groupProjects, THREE_PROJECTS_QUERY } from './projects-layout';
import { HomeRailControls } from '../../../shared/home-rail-controls/home-rail-controls';
import { SectionAction } from '../../../shared/section-action/section-action';
import { SectionFooter } from '../../../shared/section-footer/section-footer';

@Component({
  selector: 'app-projects-home-section',
  imports: [RouterLink, ProjectPreview, HomeRailControls, SectionAction, SectionFooter],
  templateUrl: './projects-home-section.html',
  styleUrl: './projects-home-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsHomeSection {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private pendingFocus: { heading: string; linkIndex: number; original: Element } | undefined;

  private readonly projectsService = inject(ProjectsService);
  readonly projects = toSignal(this.projectsService.getHomeSummaryItems(), {
    initialValue: ApiState.loading<ProjectSummary[]>(),
  });
  protected readonly columnsPerRow = signal<2 | 3>(2);
  protected readonly projectRows = computed(() => {
    const state = this.projects();
    if (state.status !== 'success') {
      return [];
    }
    return groupProjects(state.data, this.columnsPerRow());
  });

  constructor() {
    const mountMotion = injectLazyMotion();
    // Start with the same grouping on server/client, then adapt after hydration.
    afterNextRender(() => {
      const root = this.element.nativeElement;
      const view = root.ownerDocument.defaultView;
      const query = view?.matchMedia(THREE_PROJECTS_QUERY);
      if (!query || !view) {
        return;
      }
      const updateColumns = () => {
        const columns = query.matches ? 3 : 2;
        if (columns === this.columnsPerRow()) {
          return;
        }
        const focused = root.ownerDocument.activeElement;
        const card = focused?.closest('.project-preview');
        const heading = card?.getAttribute('aria-labelledby');
        if (focused && card && heading && root.contains(card)) {
          this.pendingFocus = {
            heading, original: focused,
            linkIndex: Math.max(0,
              Array.from(card.querySelectorAll('a')).indexOf(focused as HTMLAnchorElement),
            ),
          };
        }
        this.columnsPerRow.set(columns);
      };
      // Let this render's animation effect finish before scheduling a new DOM layout.
      view.queueMicrotask(() => {
        if (!this.destroyRef.destroyed) {
          updateColumns();
        }
      });
      query.addEventListener('change', updateColumns);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', updateColumns));
    });

    // Runs on the client after the projects render, so the animation only
    // mounts once the project cards are actually in the DOM.
    afterRenderEffect((onCleanup) => {
      const state = this.projects();
      // Regrouping replaces some card nodes, so rebuild the scoped animations.
      this.columnsPerRow();
      if (state.status !== 'success' || state.data.length === 0) {
        this.pendingFocus = undefined;
        return;
      }

      const root = this.element.nativeElement;
      const focus = this.pendingFocus;
      this.pendingFocus = undefined;
      if (focus) {
        const active = root.ownerDocument.activeElement;
        if (active === focus.original || active === root.ownerDocument.body) {
          const card = Array.from(root.querySelectorAll<HTMLElement>('.project-preview'))
            .find((candidate) => candidate.getAttribute('aria-labelledby') === focus.heading);
          card?.querySelectorAll<HTMLAnchorElement>('a')[focus.linkIndex]?.focus({ preventScroll: true });
        }
      }
      onCleanup(mountMotion(async () => (await import('./projects-animation')).animateProjects,
        'Projects animation could not be loaded.'));
    });
  }
}
