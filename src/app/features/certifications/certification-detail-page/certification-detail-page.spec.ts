import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import type { Certification } from '../../../core/models/certification';
import { SeoService } from '../../../core/services/seo.service';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { CaseHeroCover } from '../../../shared/portfolio/case-hero-cover';
import { CertificationDetailPage } from './certification-detail-page';

describe('CertificationDetailPage', () => {
  let fixture: ComponentFixture<CertificationDetailPage>;
  let root: HTMLElement;
  let routeData: BehaviorSubject<{ certificationState: ApiState<Certification> }>;
  const date = new Date('2024-01-01');
  const certification: Certification = {
    id: 1,
    slug: 'cloud-fundamentals',
    name: 'Cloud Fundamentals',
    issuingOrganization: 'Example Academy',
    issueDate: date,
    expirationDate: new Date('2028-04-02'),
    credentialId: 'EX-2024-001',
    credentialUrl: 'https://example.com/verify',
    thumbnail: null,
    description: '## Course material',
    technologies: [{ id: 1, name: 'Linux', order: 0 }],
    skills: [{
      id: 2, name: 'Networking', icon: '', order: 0, proficiencyId: null,
      createdAt: date, updatedAt: date, pivot: { realizationId: 1, skillId: 2 },
    }],
    order: 0,
    createdAt: date,
    updatedAt: date,
    homePage: true,
    published: true,
    seoEnabled: true,
    metaTitle: null,
    metaDescription: null,
  };

  beforeEach(async () => {
    routeData = new BehaviorSubject({ certificationState: ApiState.success(certification) });
    await TestBed.configureTestingModule({
      imports: [CertificationDetailPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData.value }, data: routeData } },
        { provide: SeoService, useValue: { updateMeta: jasmine.createSpy('updateMeta') } },
      ],
    }).overrideComponent(CertificationDetailPage, {
      set: { imports: [DatePipe, ImageUrlPipe, CaseHeroCover], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(CertificationDetailPage);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('displays credential information and the issuer verification link in the hero', () => {
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('certifications');
    expect(root.querySelector('.case-back')?.textContent?.trim()).toBe('Back to Certificates');
    expect(root.querySelector('h1')?.textContent).toBe(certification.name);
    expect(root.querySelector('.certification-id')?.textContent).toContain(certification.credentialId);
    expect(Array.from(root.querySelectorAll('time'), (time) => time.getAttribute('datetime')))
      .toEqual(['2024-01-01', '2028-04-02']);
    const verify = root.querySelector<HTMLAnchorElement>('a.case-button-primary')!;
    expect(verify.href).toBe(certification.credentialUrl);
    expect(verify.target).toBe('_blank');
    const panel = root.querySelector('.case-facts.glass.home-glass')!;
    expect(Array.from(panel.querySelectorAll('h2'), (heading) => heading.textContent?.trim())).toEqual(['Skills', 'Tech stack']);
    expect(panel.compareDocumentPosition(root.querySelector('.case-story')!) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  });

  it('omits optional credential details and the empty content section', () => {
    routeData.next({
      certificationState: ApiState.success({
        ...certification, credentialUrl: '', credentialId: '', expirationDate: null,
        description: '', skills: [], technologies: [],
      }),
    });
    fixture.detectChanges();
    expect(root.querySelectorAll('time').length).toBe(1);
    expect(root.querySelector('[data-case-actions], .certification-id, .case-hero-cover, .case-sections')).toBeNull();
  });

  it('uses the thumbnail as a hero cover when provided', () => {
    routeData.next({
      certificationState: ApiState.success({ ...certification, thumbnail: 'cover.webp' }),
    });
    fixture.detectChanges();
    expect(root.querySelector('.case-hero-cover img')).toBeTruthy();
    expect(root.querySelector('.case-preview')).toBeNull();
  });
});
