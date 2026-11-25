import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ProjectsService } from '../../../core/services/projects.service';
import { ProjectPreview } from '../project-preview/project-preview';
import { ProjectsHomeSection } from './projects-home-section';

@Component({
  selector: 'app-project-preview',
  template: `<article class="project-preview" [attr.aria-labelledby]="'project-' + project().id">
    <a [href]="'/project/' + project().slug">Details</a>
    <a href="https://example.com">Source</a>
  </article>`,
})
class TestProjectPreview {
  readonly project = input.required<ProjectSummary>();
}

describe('ProjectsHomeSection', () => {
  let fixture: ComponentFixture<ProjectsHomeSection>;
  let state: BehaviorSubject<ApiState<ProjectSummary[]>>;
  let projects: ProjectSummary[];

  beforeEach(async () => {
    const matchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake(query => {
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', { value: false });
      return media;
    });
    projects = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1, slug: `project-${index + 1}`, title: `Project ${index + 1}`,
      shortDesc: 'Description', homePage: true, published: true, order: index, technologies: [],
    }));
    state = new BehaviorSubject<ApiState<ProjectSummary[]>>(ApiState.success(projects));
    await TestBed.configureTestingModule({
      imports: [ProjectsHomeSection],
      providers: [provideRouter([]), {
        provide: ProjectsService,
        useValue: { getHomeSummaryItems: () => state.asObservable() },
      }],
    }).overrideComponent(ProjectsHomeSection, {
      remove: { imports: [ProjectPreview] }, add: { imports: [TestProjectPreview] },
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsHomeSection);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    state.complete();
  });

  it('announces loading outside the busy grid and keeps skeletons decorative', async () => {
    const root: HTMLElement = fixture.nativeElement;
    state.next(ApiState.loading());
    await fixture.whenStable();

    const grid = root.querySelector('.projects-home-grid[aria-busy="true"]')!;
    const status = root.querySelector('[role="status"]')!;
    expect(status.textContent).toContain('Loading projects');
    expect(grid.contains(status)).toBeFalse();
    expect(grid.querySelectorAll('.projects-home-skeleton').length).toBe(3);
    expect(Array.from(grid.querySelectorAll('.projects-home-skeleton'))
      .every(skeleton => skeleton.getAttribute('aria-hidden') === 'true')).toBeTrue();
  });

  it('announces an empty result in the same live region and clears the busy state', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const status = root.querySelector('[role="status"]')!;
    state.next(ApiState.success([]));
    await fixture.whenStable();

    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent).toContain('No projects to show yet');
    expect(root.querySelector('.projects-home-state[role="status"]')).toBeNull();
    expect(root.querySelector('.projects-home-grid')?.getAttribute('aria-busy')).toBe('false');
    expect(root.querySelector('.project-preview')).toBeNull();
  });

  it('announces API errors without exposing backend details', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const status = root.querySelector('[role="status"]')!;
    state.next(ApiState.error('Sensitive backend error'));
    await fixture.whenStable();

    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent?.trim()).toBe('');
    expect(root.querySelector('.projects-home-state[role="alert"]')?.textContent)
      .toContain('Projects could not be loaded');
    expect(root.querySelector('.projects-home-grid')?.getAttribute('aria-busy')).toBe('false');
    expect(root.querySelector('.projects-home-skeleton, .project-preview')).toBeNull();
    expect(root.textContent).not.toContain('Sensitive backend error');
  });

  it('keeps the focused link and keyed cards when fresh data arrives', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const selector = '.projects-home-grid > .projects-home-slot > .projects-home-motion > app-project-preview';
    const cards = Array.from(root.querySelectorAll(selector));
    const focused = cards[2].querySelectorAll<HTMLAnchorElement>('a')[1];
    focused.focus();
    expect(document.activeElement).toBe(focused);

    state.next(ApiState.success(projects.map(project => ({ ...project, slug: `${project.slug}-updated` }))));
    await fixture.whenStable();
    const updated = Array.from(root.querySelectorAll(selector));
    expect(updated).toHaveSize(projects.length);
    updated.forEach((card, index) => expect(card).toBe(cards[index]));
    expect(cards[2].querySelector('a')?.getAttribute('href')).toBe('/project/project-3-updated');
    expect(document.activeElement).toBe(focused);
  });
});
