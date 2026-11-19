import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { ProjectsService } from '../../../core/services/projects.service';
import { PaginationTiles } from '../../../shared/pagination/pagination-tiles/pagination-tiles';
import { ProjectsPage } from './projects-page';

describe('ProjectsPage', () => {
  let fixture: ComponentFixture<ProjectsPage>;
  let projects: jasmine.SpyObj<ProjectsService>;

  beforeEach(async () => {
    projects = jasmine.createSpyObj<ProjectsService>('ProjectsService', ['getAllPaginated']);
    await TestBed.configureTestingModule({
      imports: [ProjectsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [provideRouter([]), { provide: ProjectsService, useValue: projects }],
    }).overrideComponent(ProjectsPage, {
      set: { imports: [PaginationTiles], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsPage);
  });

  async function renderArchive(): Promise<HTMLElement> {
    fixture.detectChanges();
    await fixture.whenStable();
    const [archive] = await fixture.getDeferBlocks();
    await archive.render(DeferBlockState.Complete);
    return fixture.nativeElement;
  }

  it('keeps the Projects grain and archive heading visible in the empty state', async () => {
    projects.getAllPaginated.and.returnValue(of(ApiState.success({
      data: [], meta: { currentPage: 1, lastPage: 1, perPage: 9, total: 0, from: 0, to: 0 },
    })));
    const root = await renderArchive();
    expect(projects.getAllPaginated).toHaveBeenCalledOnceWith(1);
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('projects');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('All Projects');
    expect(root.querySelector('.archive-state')?.textContent).toContain('No projects available');
  });

  it('reports a failed request rather than showing an empty archive', async () => {
    projects.getAllPaginated.and.returnValue(of({ status: 'error' as const, error: 'Could not load projects' }));
    const root = await renderArchive();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Error loading projects');
    expect(root.querySelector('.archive-grid')).toBeNull();
  });
});
