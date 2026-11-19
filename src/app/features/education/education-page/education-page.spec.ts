import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { EducationService } from '../../../core/services/education.service';
import { PaginationTiles } from '../../../shared/pagination/pagination-tiles/pagination-tiles';
import { EducationPage } from './education-page';

describe('EducationPage', () => {
  let fixture: ComponentFixture<EducationPage>;
  let education: jasmine.SpyObj<EducationService>;

  beforeEach(async () => {
    education = jasmine.createSpyObj<EducationService>('EducationService', ['getAllPaginated']);
    await TestBed.configureTestingModule({
      imports: [EducationPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [provideRouter([]), { provide: EducationService, useValue: education }],
    }).overrideComponent(EducationPage, {
      set: { imports: [PaginationTiles], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(EducationPage);
  });

  async function renderArchive(): Promise<HTMLElement> {
    fixture.detectChanges();
    await fixture.whenStable();
    const [archive] = await fixture.getDeferBlocks();
    await archive.render(DeferBlockState.Complete);
    return fixture.nativeElement;
  }

  it('keeps the Education chapter visible when the archive is empty', async () => {
    education.getAllPaginated.and.returnValue(of(ApiState.success({
      data: [], meta: { currentPage: 1, lastPage: 1, perPage: 9, total: 0, from: 0, to: 0 },
    })));
    const root = await renderArchive();
    expect(education.getAllPaginated).toHaveBeenCalledOnceWith(1);
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('education');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('My Education');
    expect(root.querySelector('.archive-state')?.textContent).toContain('No education entries');
  });

  it('distinguishes an error from an empty archive', async () => {
    education.getAllPaginated.and.returnValue(of({ status: 'error' as const, error: 'Request failed' }));
    const root = await renderArchive();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Error loading education');
    expect(root.querySelector('.archive-grid')).toBeNull();
  });
});
