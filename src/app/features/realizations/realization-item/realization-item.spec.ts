import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { RealizationSummary } from '../../../core/models/summary/realization';
import { RealizationItem } from './realization-item';

describe('RealizationItem', () => {
  let fixture: ComponentFixture<RealizationItem>;
  const realization: RealizationSummary = {
    id: 1,
    slug: 'client-portal',
    title: 'Client Portal',
    shortDesc: 'A self-service portal for client orders.',
    clientName: 'Example Client',
    clientUrl: null,
    location: null,
    thumbnail: '/preview.png',
    homePage: true,
    published: true,
    order: 1,
    technologies: [{ id: 1, name: 'Angular' }],
    skills: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RealizationItem], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(RealizationItem);
    fixture.componentRef.setInput('realization', realization);
    fixture.detectChanges();
  });

  it('keeps the thumbnail framed above the copy instead of stretching it behind the card', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/realization/client-portal');
    const media = root.querySelector('.archive-card-media')!;
    expect(media.querySelector('img.archive-card-cover')).toBeNull();
    expect(getComputedStyle(media).position).not.toBe('absolute');
    expect(getComputedStyle(root, '::before').content).toBe('none');
  });

  it('falls back to a black card with a media placeholder when there is no thumbnail', () => {
    fixture.componentRef.setInput('realization', { ...realization, thumbnail: '' });
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('.archive-card-media svg')).toBeTruthy();
    expect(getComputedStyle(root.querySelector('.archive-card')!).backgroundColor).toBe('rgb(0, 0, 0)');
  });
});
