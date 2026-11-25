import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { RealizationsService } from '../../../core/services/realizations.service';
import { PaginationTiles } from '../../../shared/pagination/pagination-tiles/pagination-tiles';
import { RealizationsPage } from './realizations-page';

describe('RealizationsPage', () => {
  let fixture: ComponentFixture<RealizationsPage>;
  let realizations: jasmine.SpyObj<RealizationsService>;

  beforeEach(async () => {
    realizations = jasmine.createSpyObj<RealizationsService>('RealizationsService', ['getAllPaginated']);
    await TestBed.configureTestingModule({
      imports: [RealizationsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [provideRouter([]), { provide: RealizationsService, useValue: realizations }],
    }).overrideComponent(RealizationsPage, {
      set: { imports: [PaginationTiles], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(RealizationsPage);
  });

  async function renderArchive(): Promise<HTMLElement> {
    fixture.detectChanges();
    await fixture.whenStable();
    const [archive] = await fixture.getDeferBlocks();
    await archive.render(DeferBlockState.Complete);
    return fixture.nativeElement;
  }

  it('keeps the Work grain and archive heading visible when there are no entries', async () => {
    realizations.getAllPaginated.and.returnValue(of(ApiState.success({
      data: [], meta: { currentPage: 1, lastPage: 1, perPage: 9, total: 0, from: 0, to: 0 },
    })));
    const root = await renderArchive();
    expect(realizations.getAllPaginated).toHaveBeenCalledOnceWith(1);
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('work');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('All Realizations');
    expect(root.querySelector('.archive-state')?.textContent).toContain('No realizations available');
  });

  it('shows an error when the archive request fails', async () => {
    realizations.getAllPaginated.and.returnValue(of({ status: 'error' as const, error: 'Request failed' }));
    const root = await renderArchive();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Error loading realizations');
    expect(root.querySelector('.archive-grid')).toBeNull();
  });
});
