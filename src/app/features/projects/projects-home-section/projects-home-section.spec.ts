import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {ApiState} from '../../../core/models/api.state';
import {ProjectSummary} from '../../../core/models/summary/project';
import {ProjectsService} from '../../../core/services/projects.service';
import {ProjectsHomeSection} from './projects-home-section';

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
    state = new BehaviorSubject<ApiState<ProjectSummary[]>>(ApiState.loading());
    await TestBed.configureTestingModule({
      imports: [ProjectsHomeSection],
      providers: [provideRouter([]), {
        provide: ProjectsService,
        useValue: { getHomeSummaryItems: () => state.asObservable() },
      }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsHomeSection);
    await fixture.whenStable();
  });

  afterEach(() => state.complete());

  it('excludes animated copy from scroll anchoring while keeping the rail eligible', () => {
    const root: HTMLElement = fixture.nativeElement;
    const header = root.querySelector<HTMLElement>('.projects-home-header')!;
    const grid = root.querySelector<HTMLElement>('.projects-home-grid')!;

    expect(getComputedStyle(header).getPropertyValue('overflow-anchor')).toBe('none');
    expect(getComputedStyle(grid).getPropertyValue('overflow-anchor')).toBe('auto');
  });

  it('announces loading outside the busy grid and keeps skeletons decorative', () => {
    const root: HTMLElement = fixture.nativeElement;

    const grid = root.querySelector('.projects-home-grid[aria-busy="true"]')!;
    const status = root.querySelector('[role="status"]')!;
    expect(status.textContent).toContain('Loading projects');
    expect(grid.contains(status)).toBeFalse();
    expect(grid.querySelectorAll('.projects-home-skeleton').length).toBe(3);
    expect(Array.from(grid.querySelectorAll('.projects-home-skeleton'))
      .every(skeleton => skeleton.getAttribute('aria-hidden') === 'true')).toBeTrue();
  });

  it('replaces loading skeletons with real preview links and clears the live region', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const status = root.querySelector('[role="status"]')!;
    const grid = root.querySelector('.projects-home-grid')!;
    expect(status.textContent).toContain('Loading projects');

    state.next(ApiState.success(projects));
    await fixture.whenStable();

    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent?.trim()).toBe('');
    expect(grid.getAttribute('aria-busy')).toBe('false');
    expect(grid.querySelector('.projects-home-skeleton, .projects-home-state')).toBeNull();
    const links = Array.from(grid.querySelectorAll('.project-preview-title a'));
    expect(links.map(link => link.textContent?.trim())).toEqual(projects.map(project => project.title));
    expect(links.map(link => link.getAttribute('href'))).toEqual(
      projects.map(project => `/project/${project.slug}`),
    );
  });

  it('announces an empty result in the same live region and clears the busy state', async () => {
    const root: HTMLElement = fixture.nativeElement;
    const status = root.querySelector('[role="status"]')!;
    state.next(ApiState.success([]));
    await fixture.whenStable();

    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent).toContain('No projects to show yet');
    const message = root.querySelector('.projects-home-state')!;
    expect(message.textContent).toContain('No projects to show yet');
    expect(message.hasAttribute('role')).toBeFalse();
    expect(root.querySelector('.projects-home-grid')?.getAttribute('aria-busy')).toBe('false');
    expect(root.querySelector('.projects-home-skeleton, .project-preview')).toBeNull();
  });

  it('keeps mobile photos and cards equal-sized despite different content and missing thumbnails', async () => {
    state.next(ApiState.success([
      {
        ...projects[0],
        title: 'A longer project title that wraps onto several lines on mobile',
        shortDesc: 'A detailed project description with extra context. '.repeat(8),
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="960" height="660"/%3E',
        technologies: Array.from({ length: 12 }, (_, id) => ({ id, name: `Technology ${id}` })),
      },
      { ...projects[1], shortDesc: '', thumbnail: null },
      { ...projects[2], title: 'Short title', thumbnail: null },
    ]));
    await fixture.whenStable();

    // A real narrow viewport exercises the CSS media query without resizing Karma.
    const viewport = document.createElement('iframe');
    viewport.style.height = '900px';
    document.body.append(viewport);
    try {
      const mobileDocument = viewport.contentDocument!;
      for (const style of document.head.querySelectorAll('style, link[rel="stylesheet"]')) {
        mobileDocument.head.append(style.cloneNode(true));
      }
      const root: HTMLElement = fixture.nativeElement;
      mobileDocument.body.append(root);
      const cards = Array.from(root.querySelectorAll<HTMLElement>('.project-preview'));
      const visuals = Array.from(root.querySelectorAll<HTMLElement>('.project-preview-visual'));
      expect(cards.length).toBe(3);
      expect(root.querySelectorAll('.project-preview-fallback').length).toBe(2);

      for (const width of [320, 390, 767]) {
        viewport.style.width = `${width}px`;
        const heights = cards.map(card => card.getBoundingClientRect().height);
        const photoHeights = visuals.map(visual => visual.getBoundingClientRect().height);
        expect(heights[0]).withContext(`${width}px card height`).toBeGreaterThan(0);
        for (let index = 0; index < cards.length; index++) {
          expect(heights[index]).withContext(`${width}px card ${index}`).toBeCloseTo(heights[0], 1);
          expect(photoHeights[index]).withContext(`${width}px photo ${index}`).toBeCloseTo(photoHeights[0], 1);
          const description = cards[index].querySelector<HTMLElement>('.project-preview-description')!;
          expect(description.scrollHeight).withContext(`${width}px description ${index}`)
            .toBeLessThanOrEqual(description.clientHeight);
        }
      }
    } finally {
      viewport.remove();
    }
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
    state.next(ApiState.success(projects));
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const selector = '.projects-home-grid > .projects-home-slot > .projects-home-motion > app-project-preview';
    const cards = Array.from(root.querySelectorAll(selector));
    const focused = cards[2].querySelector<HTMLAnchorElement>('.project-preview-title a')!;
    focused.focus();
    expect(document.activeElement).toBe(focused);

    state.next(ApiState.success(projects.map(project => ({ ...project, slug: `${project.slug}-updated` }))));
    await fixture.whenStable();
    const updated = Array.from(root.querySelectorAll(selector));
    expect(updated).toHaveSize(projects.length);
    updated.forEach((card, index) => expect(card).toBe(cards[index]));
    expect(focused.getAttribute('href')).toBe('/project/project-3-updated');
    expect(document.activeElement).toBe(focused);
  });
});
