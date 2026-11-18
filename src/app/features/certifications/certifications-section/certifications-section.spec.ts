import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificationsSection } from './certifications-section';
import { CertificationsService } from '../../../core/services/certifications.service';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { CertificationSummary } from '../../../core/models/summary/certification';

describe('CertificationsSection', () => {
  let component: CertificationsSection;
  let fixture: ComponentFixture<CertificationsSection>;
  let response: Subject<ApiState<CertificationSummary[]>>;
  let service: jasmine.SpyObj<CertificationsService>;

  const certificate: CertificationSummary = {
    id: 1,
    slug: 'angular-development',
    name: 'Angular Development',
    shortDesc: 'Modern Angular applications.',
    issuingOrganization: 'Example Academy',
    issueDate: new Date('2025-06-12'),
    expirationDate: null,
    thumbnail: null,
    homePage: true,
    published: true,
    order: 1,
    technologies: [],
    skills: [],
  };

  function render(state: ApiState<CertificationSummary[]>): HTMLElement {
    response.next(state);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    response = new Subject<ApiState<CertificationSummary[]>>();
    service = jasmine.createSpyObj<CertificationsService>('CertificationsService', [
      'getHomeSummaryItems',
    ]);
    service.getHomeSummaryItems.and.returnValue(response);

    await TestBed.configureTestingModule({
      imports: [CertificationsSection],
      providers: [
        provideRouter([]),
        { provide: CertificationsService, useValue: service },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CertificationsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(service.getHomeSummaryItems).toHaveBeenCalledTimes(1);
  });

  it('groups the intro and primary catalogue CTA in one glass panel above the wall', () => {
    const root = fixture.nativeElement as HTMLElement;
    const header = root.querySelector('.certifications-header')!;

    expect(header.classList).toContain('home-copy-panel');
    expect(header.querySelector('#certifications-heading')).not.toBeNull();
    expect(header.querySelector('p')?.classList).not.toContain('glass');
    expect(header.querySelector('.certifications-viewall')?.classList).toContain('section-action-cta');
    expect(header.nextElementSibling?.classList).toContain('certifications-wall');
  });

  it('reserves document space and announces loading', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.certifications-wall')?.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelectorAll('.certifications-skeleton').length).toBe(3);
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Loading');
  });

  it('renders asynchronous results in the supplied order with detail links', () => {
    const root = render(ApiState.success([
      { ...certificate, id: 2, slug: 'second', name: 'Second Certificate' },
      certificate,
    ]));
    const links = root.querySelectorAll<HTMLAnchorElement>('.certificate-link');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/certification/second');
    expect(links[1].getAttribute('href')).toBe('/certification/angular-development');
    expect(root.querySelector('.certifications-wall')?.getAttribute('data-count')).toBe('2');
    expect(root.querySelector('.certifications-wall')?.getAttribute('aria-busy')).toBe('false');
    expect(root.querySelector('.certificate-caption')?.textContent).toContain('Example Academy');
    expect(root.querySelector('.certificate-caption [aria-hidden].certificate-caption-arrow')).toBeNull();
    expect(root.querySelector('.certificate-index')).toBeNull();
    expect(root.querySelector('time')?.getAttribute('datetime')).toBe('2025-06-12');
  });

  it('provides a document fallback without inventing a credential', () => {
    const root = render(ApiState.success([certificate]));
    expect(root.querySelector('.certificate-fallback-title')?.textContent).toBe(certificate.name);
    expect(root.querySelector('.certificate-fallback-issuer')?.textContent).toBe(certificate.issuingOrganization);
    const link = root.querySelector('.certificate-link')!;
    expect(link.getAttribute('aria-labelledby')).toBe('certificate-title-1');
    expect(root.querySelector('#certificate-title-1')?.textContent).toBe(certificate.name);
    expect(root.querySelector('.certificate-metadata')).toBeNull();
  });

  it('pairs available technology and skill pills with the certificate metadata', () => {
    const root = render(ApiState.success([{
      ...certificate,
      technologies: [{ id: 1, name: 'Angular' }],
      skills: [{ id: 2, name: 'Testing' }],
    }]));
    const metadata = root.querySelector('.certificate-metadata')!;
    expect(metadata.querySelector('[aria-label="Technologies"] .home-metadata-pill')?.textContent)
      .toBe('Angular');
    expect(metadata.querySelector('[aria-label="Skills"] .home-metadata-pill')?.textContent)
      .toBe('Testing');
    expect(root.querySelector('.certificate-link')?.getAttribute('aria-describedby')).toBe('certificate-meta-1');
  });

  it('shows uncropped artwork and falls back when the image fails', () => {
    const root = render(ApiState.success([{ ...certificate, thumbnail: 'https://example.com/certificate.png' }]));
    const image = root.querySelector<HTMLImageElement>('.certificate-image')!;
    expect(image.getAttribute('src')).toBe('https://example.com/certificate.png');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('alt')).toBe('');
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(root.querySelector('.certificate-image')).toBeNull();
    expect(root.querySelector('.certificate-fallback-title')?.textContent).toBe(certificate.name);
  });

  it('renders an empty state and keeps the full catalogue link', () => {
    const root = render(ApiState.success([]));
    expect(root.querySelector('.certifications-state')?.textContent).toContain('New certifications');
    expect(root.querySelector('.certifications-viewall')?.getAttribute('href')).toBe('/certifications');
    expect(root.querySelector('.certificate-link')).toBeNull();
  });

  it('renders a friendly error without exposing backend details', () => {
    const root = render(ApiState.error('Sensitive backend error'));
    expect(root.querySelector('[role="status"]')?.textContent).toContain('could not be loaded');
    expect(root.textContent).not.toContain('Sensitive backend error');
    expect(root.querySelector('.certifications-skeleton')).toBeNull();
  });

  it('updates the wall when the selection changes', () => {
    render(ApiState.success([certificate, { ...certificate, id: 2, slug: 'second' }]));
    const root = render(ApiState.success([certificate]));
    expect(root.querySelectorAll('.certificate-link').length).toBe(1);
    expect(root.querySelector('.certifications-wall')?.getAttribute('data-count')).toBe('1');
  });
});
