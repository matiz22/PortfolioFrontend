import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {HeroSection} from './hero-section';

describe('HeroSection', () => {
  let component: HeroSection;
  let fixture: ComponentFixture<HeroSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSection],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeroSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses a value-led headline and places the name in the portrait caption', () => {
    const element: HTMLElement = fixture.nativeElement;
    const headline = element.querySelector('h1');

    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(headline?.textContent).toContain('Thoughtful software.');
    expect(headline?.textContent).toContain('Smarter workflows.');
    expect(element.querySelector('figure figcaption .hero-name')?.textContent).toBe('Mateusz Malich');
    expect(element.querySelector('.hero-copy')?.textContent).not.toContain('Mateusz Malich');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(headline?.id);
  });

  it('separates the professional title from the specialization in the portrait caption', () => {
    const caption: HTMLElement = fixture.nativeElement.querySelector('figure figcaption');

    expect(caption.querySelector('.hero-role-title')?.textContent).toBe('Software Engineer');
    expect(caption.querySelector('.hero-role-specialty')?.textContent).toBe('AI & Automation');
  });

  it('places the portrait first in the reading order for the compact layout', () => {
    const layout: HTMLElement = fixture.nativeElement.querySelector('.hero-layout');

    expect(layout.firstElementChild?.classList.contains('hero-portrait')).toBeTrue();
    expect(layout.lastElementChild?.classList.contains('hero-copy')).toBeTrue();
  });

  it('keeps the work and contact actions linked to their sections', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.hero-cta-primary')?.getAttribute('href')).toBe('/#work');
    expect(element.querySelector('.hero-cta-secondary')?.getAttribute('href')).toBe('/#contact');
  });
});
