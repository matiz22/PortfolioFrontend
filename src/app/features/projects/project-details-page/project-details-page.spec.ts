import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { Project } from '../../../core/models/project';
import { SeoService } from '../../../core/services/seo.service';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { CaseHeroCover } from '../../../shared/portfolio/case-hero-cover';
import { ProjectDetailsPage } from './project-details-page';

describe('ProjectDetailsPage', () => {
  let fixture: ComponentFixture<ProjectDetailsPage>;
  let root: HTMLElement;
  let routeData: BehaviorSubject<{ projectState: ApiState<Project> }>;
  const project: Project = {
    id: 1,
    slug: 'developer-toolkit',
    title: 'Developer Toolkit',
    shortDesc: 'A small collection of everyday tools.',
    description: '## About the toolkit',
    thumbnail: null,
    liveUrl: 'https://example.com/toolkit',
    repoUrl: 'https://example.com/source',
    screenshots: ['screenshot.png'],
    technologies: [
      { id: 1, name: 'Angular', order: 0 },
      { id: 2, name: 'angular', order: 1 },
    ],
    order: 0,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    homePage: true,
    published: true,
    seoEnabled: true,
    metaTitle: null,
    metaDescription: null,
  };

  beforeEach(async () => {
    routeData = new BehaviorSubject({ projectState: ApiState.success(project) });
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData.value }, data: routeData } },
        { provide: SeoService, useValue: { updateMeta: jasmine.createSpy('updateMeta') } },
      ],
    }).overrideComponent(ProjectDetailsPage, {
      set: { imports: [ImageUrlPipe, CaseHeroCover], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectDetailsPage);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('puts the project links in the hero and the glass tech stack before the story and gallery', () => {
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('projects');
    expect(root.querySelector('.case-back')?.textContent?.trim()).toBe('All Projects');
    const links = root.querySelectorAll('[data-case-actions] a');
    expect(Array.from(links, (link) => link.getAttribute('href'))).toEqual([project.liveUrl!, project.repoUrl!]);
    expect(root.querySelector('.case-hero .case-chip')).toBeNull();
    const panel = root.querySelector('.case-facts.glass.home-glass')!;
    expect(Array.from(panel.querySelectorAll('li'), (chip) => chip.textContent?.trim())).toEqual(['Angular']);
    const story = root.querySelector('.case-story')!;
    expect(panel.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(story.compareDocumentPosition(root.querySelector('.case-screenshots')!) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  });

  it('keeps a source-only project usable and omits empty sections', () => {
    routeData.next({
      projectState: ApiState.success({ ...project, liveUrl: null, description: '', technologies: [], screenshots: [] }),
    });
    fixture.detectChanges();
    expect(root.querySelector('[data-case-actions] a.case-button-primary')?.getAttribute('href')).toBe(project.repoUrl!);
    expect(root.querySelector('.case-hero-cover, .case-sections')).toBeNull();
  });

  it('spreads the thumbnail behind the hero as a cover instead of a framed preview', () => {
    routeData.next({ projectState: ApiState.success({ ...project, thumbnail: 'cover.webp' }) });
    fixture.detectChanges();
    const cover = root.querySelector('.case-hero-cover img')!;
    expect(cover).toBeTruthy();
    expect(cover.getAttribute('alt')).toBe('');
    expect(getComputedStyle(cover).objectFit).toBe('cover');
    expect(root.querySelector('.case-preview')).toBeNull();
  });
});
