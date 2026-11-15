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
});
