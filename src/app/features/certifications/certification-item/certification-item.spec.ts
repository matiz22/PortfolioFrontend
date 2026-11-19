import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { CertificationSummary } from '../../../core/models/summary/certification';
import { CertificationItem } from './certification-item';

describe('CertificationItem', () => {
  let fixture: ComponentFixture<CertificationItem>;
  const certification: CertificationSummary = {
    id: 1,
    slug: 'cloud-fundamentals',
    name: 'Cloud Fundamentals',
    shortDesc: '',
    issuingOrganization: 'Example Academy',
    issueDate: new Date('2024-01-01'),
    expirationDate: null,
    thumbnail: null,
    homePage: true,
    published: true,
    order: 1,
    technologies: [{ id: 1, name: 'Linux' }],
    skills: [{ id: 1, name: 'Linux' }, { id: 2, name: 'Networking' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CertificationItem], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(CertificationItem);
    fixture.componentRef.setInput('certification', certification);
    fixture.detectChanges();
  });

  it('leads with the certificate name, issuer and issue date without an empty preview', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/certification/cloud-fundamentals');
    expect(root.querySelector('h2')?.textContent).toBe(certification.name);
    expect(root.querySelector('.certification-issuer')?.textContent).toBe(certification.issuingOrganization);
    const time = root.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe('2024-01-01');
    expect(time?.textContent).toBe('Jan 2024');
    expect(root.querySelector('.archive-card-media')).toBeNull();
  });

  it('uses the thumbnail as a decorative cover and retains the card when the image fails', () => {
    const root: HTMLElement = fixture.nativeElement;
    const thumbnail = 'https://example.com/cloud.png';
    fixture.componentRef.setInput('certification', { ...certification, thumbnail });
    fixture.detectChanges();

    const image = root.querySelector<HTMLImageElement>('.certificate-cover > .certificate-cover-image')!;
    expect(image.getAttribute('src')).toBe(thumbnail);
    expect(image.getAttribute('alt')).toBe('');
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(root.querySelector('.certificate-cover-image')).toBeNull();
    expect(root.querySelector('.certificate-cover-copy h2')?.textContent).toBe(certification.name);
  });

  it('displays each tag once even when both skill and technology lists include it', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(Array.from(root.querySelectorAll('.archive-card-technologies li'), (item) => item.textContent?.trim()))
      .toEqual(['Linux', 'Networking']);
  });
});
