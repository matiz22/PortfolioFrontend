import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { CertificationsService } from '../../../core/services/certifications.service';
import { PaginationTiles } from '../../../shared/pagination/pagination-tiles/pagination-tiles';
import { CertificationsPage } from './certifications-page';

describe('CertificationsPage', () => {
  let fixture: ComponentFixture<CertificationsPage>;
  let certificates: jasmine.SpyObj<CertificationsService>;

  beforeEach(async () => {
    certificates = jasmine.createSpyObj<CertificationsService>('CertificationsService', ['getAllPaginated']);
    await TestBed.configureTestingModule({
      imports: [CertificationsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [provideRouter([]), { provide: CertificationsService, useValue: certificates }],
    }).overrideComponent(CertificationsPage, {
      set: { imports: [PaginationTiles], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(CertificationsPage);
  });

  async function renderArchive(): Promise<HTMLElement> {
    fixture.detectChanges();
    await fixture.whenStable();
    const [archive] = await fixture.getDeferBlocks();
    await archive.render(DeferBlockState.Complete);
    return fixture.nativeElement;
  }

  it('keeps the Certificates grain and archive heading visible when there are no entries', async () => {
    certificates.getAllPaginated.and.returnValue(of(ApiState.success({
      data: [], meta: { currentPage: 1, lastPage: 1, perPage: 9, total: 0, from: 0, to: 0 },
    })));
    const root = await renderArchive();
    expect(certificates.getAllPaginated).toHaveBeenCalledOnceWith(1);
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('certifications');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('All Certifications');
    expect(root.querySelector('.archive-state')?.textContent).toContain('No certifications available');
  });

  it('shows an error when the archive request fails', async () => {
    certificates.getAllPaginated.and.returnValue(of({ status: 'error' as const, error: 'Request failed' }));
    const root = await renderArchive();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Error loading certifications');
    expect(root.querySelector('.archive-grid')).toBeNull();
  });
});
