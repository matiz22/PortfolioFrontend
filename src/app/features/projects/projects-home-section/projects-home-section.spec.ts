import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { ProjectSummary } from '../../../core/models/summary/project';
import { ProjectsService } from '../../../core/services/projects.service';
import { ProjectPreview } from '../project-preview/project-preview';
import { THREE_PROJECTS_QUERY } from './projects-layout';
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

describe('ProjectsHomeSection responsive focus', () => {
  let fixture: ComponentFixture<ProjectsHomeSection>;
  let wide: boolean;
  let columnsQuery: MediaQueryList;

  beforeEach(async () => {
    wide = false;
    const matchMedia = window.matchMedia.bind(window);
    columnsQuery = matchMedia(THREE_PROJECTS_QUERY);
    Object.defineProperty(columnsQuery, 'matches', { get: () => wide });
    spyOn(window, 'matchMedia').and.callFake(query => {
      if (query === THREE_PROJECTS_QUERY) return columnsQuery;
      const media = matchMedia(query);
      Object.defineProperty(media, 'matches', { value: false });
      return media;
    });
    const projects: ProjectSummary[] = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1, slug: `project-${index + 1}`, title: `Project ${index + 1}`,
      shortDesc: 'Description', homePage: true, published: true, order: index, technologies: [],
    }));
    await TestBed.configureTestingModule({
      imports: [ProjectsHomeSection],
      providers: [provideRouter([]), {
        provide: ProjectsService,
        useValue: { getHomeSummaryItems: () => of(ApiState.success(projects)) },
      }],
    }).overrideComponent(ProjectsHomeSection, {
      remove: { imports: [ProjectPreview] }, add: { imports: [TestProjectPreview] },
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsHomeSection);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('keeps the focused project and action when regrouping two columns into three and back', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const source = () => root.querySelectorAll<HTMLAnchorElement>('[aria-labelledby="project-3"] a')[1];
    const first = source();
    first.focus();
    expect(document.activeElement).toBe(first);
    expect(root.querySelectorAll('.projects-home-row')).toHaveSize(3);

    wide = true;
    columnsQuery.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelectorAll('.projects-home-row')).toHaveSize(2);
    expect(document.activeElement).toBe(source());
    expect(first.isConnected).toBeFalse();

    wide = false;
    columnsQuery.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelectorAll('.projects-home-row')).toHaveSize(3);
    expect(document.activeElement).toBe(source());
  });
});
