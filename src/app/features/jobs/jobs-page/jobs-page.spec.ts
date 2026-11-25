import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { JobsService } from '../../../core/services/jobs.service';
import { PaginationTiles } from '../../../shared/pagination/pagination-tiles/pagination-tiles';
import { JobsPage } from './jobs-page';

describe('JobsPage', () => {
  let fixture: ComponentFixture<JobsPage>;
  let jobs: jasmine.SpyObj<JobsService>;

  beforeEach(async () => {
    jobs = jasmine.createSpyObj<JobsService>('JobsService', ['getAllPaginated']);
    await TestBed.configureTestingModule({
      imports: [JobsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [provideRouter([]), { provide: JobsService, useValue: jobs }],
    }).overrideComponent(JobsPage, {
      set: { imports: [PaginationTiles], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(JobsPage);
  });

  async function renderArchive(): Promise<HTMLElement> {
    fixture.detectChanges();
    await fixture.whenStable();
    const [archive] = await fixture.getDeferBlocks();
    await archive.render(DeferBlockState.Complete);
    return fixture.nativeElement;
  }

  it('keeps the Experience grain visible when the archive is empty', async () => {
    jobs.getAllPaginated.and.returnValue(of(ApiState.success({
      data: [], meta: { currentPage: 1, lastPage: 1, perPage: 9, total: 0, from: 0, to: 0 },
    })));
    const root = await renderArchive();
    expect(jobs.getAllPaginated).toHaveBeenCalledOnceWith(1);
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('experience');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Work Experience');
    expect(root.querySelector('.archive-state')?.textContent).toContain('No work experience entries');
  });

  it('shows an error when the archive request fails', async () => {
    jobs.getAllPaginated.and.returnValue(of({ status: 'error' as const, error: 'Request failed' }));
    const root = await renderArchive();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Error loading work experience');
    expect(root.querySelector('.archive-grid')).toBeNull();
  });
});
