import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AboutMeSection} from './about-me-section';

describe('AboutMeSection', () => {
  let component: AboutMeSection;
  let fixture: ComponentFixture<AboutMeSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMeSection]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AboutMeSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps named service navigation without decorative numbers', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.about-index-number')).toBeNull();
    expect(root.querySelectorAll('.about-index-title').length).toBe(3);
    expect(root.querySelector('.about-index-link')?.textContent).toContain('Web Development');
    expect(root.querySelector('app-web-development-preview .input')?.textContent).toBe('https://your.company');
  });

  it('frosts service navigation and the AI scene without frosting service headings', () => {
    const root: HTMLElement = fixture.nativeElement;
    const index = root.querySelector<HTMLElement>('.about-index')!;
    expect(index.classList).toContain('glass');
    expect(index.classList).toContain('home-glass');
    // One shared panel with the scroll line; the rows stay plain.
    expect(root.querySelectorAll('.about-index-link.home-glass').length).toBe(0);
    expect(index.querySelector('.about-track')).not.toBeNull();
    expect(root.querySelectorAll('.about-index-link').length).toBe(3);
    expect(root.querySelector('.about-ai-visual')?.classList).toContain('home-glass');
    expect(root.querySelector('.about-web-visual')?.classList).not.toContain('home-glass');
    expect(root.querySelector('.about-header')?.classList.contains('home-glass')).toBeFalse();
    expect(getComputedStyle(root.querySelector('.about-ai-visual')!).backdropFilter).toContain('blur(');
  });
});
