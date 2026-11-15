import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RealizationSummary } from '../../../../core/models/summary/realization';
import { RealizationShowcaseCard } from './realization-showcase-card';

describe('RealizationShowcaseCard', () => {
  let fixture: ComponentFixture<RealizationShowcaseCard>;
  let root: HTMLElement;
  const realization: RealizationSummary = {
    id: 1,
    slug: 'company-website',
    title: 'Company website',
    shortDesc: 'A fast, accessible website for a local business.',
    clientName: 'Example Company',
    clientUrl: 'https://example.com',
    location: 'Poland',
    thumbnail: 'https://example.com/website.png',
    homePage: true,
    published: true,
    order: 1,
    technologies: [{ id: 1, name: 'Angular' }],
    skills: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizationShowcaseCard],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(RealizationShowcaseCard);
    fixture.componentRef.setInput('realization', realization);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('presents the work without decorative numbering', () => {
    expect(root.querySelector('h3')?.textContent).toContain(realization.title);
    expect(root.querySelector('.realization-card-number')).toBeNull();
    expect(root.querySelector('.realization-card-desc')?.textContent).toBe(realization.shortDesc);
    expect(root.querySelector('img')?.getAttribute('src')).toBe(realization.thumbnail);
  });

  it('keeps the whole-card detail link separate from the external client link', () => {
    const links = root.querySelectorAll<HTMLAnchorElement>('a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/realization/company-website');
    expect(links[0].textContent).toBe(realization.title);
    expect(links[1].getAttribute('href')).toBe(realization.clientUrl);
    expect(links[1].rel).toContain('noopener');
    expect(links[1].rel).toContain('noreferrer');
    expect(root.querySelector('a a')).toBeNull();
    expect(getComputedStyle(links[0], '::after').position).toBe('absolute');
    expect(getComputedStyle(root.querySelector('article')!).borderTopWidth).toBe('1px');
  });

  it('keeps the client name when no external URL is available', () => {
    fixture.componentRef.setInput('realization', { ...realization, clientUrl: null });
    fixture.detectChanges();
    expect(root.querySelectorAll('a').length).toBe(1);
    expect(root.querySelector('.realization-card-client')?.textContent).toContain(realization.clientName);
  });
});
