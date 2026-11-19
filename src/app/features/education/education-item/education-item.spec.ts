import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { EducationSummary } from '../../../core/models/summary/education';
import { EducationItem } from './education-item';

describe('EducationItem', () => {
  let fixture: ComponentFixture<EducationItem>;
  const education: EducationSummary = {
    id: 1,
    slug: 'computer-science',
    degree: 'Bachelor of Science',
    institution: 'Example University',
    fieldOfStudy: 'Computer Science',
    grade: null,
    description: '',
    startDate: new Date('2024-01-01'),
    endDate: null,
    isCurrent: true,
    thumbnail: null,
    homePage: true,
    published: true,
    order: 1,
    technologies: [],
    skills: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [EducationItem], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(EducationItem);
    fixture.componentRef.setInput('education', education);
    fixture.detectChanges();
  });

  it('shows the academic record and localized current date label without an empty media frame', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/education/computer-science');
    expect(root.querySelector('h2')?.textContent).toBe(education.degree);
    expect(root.querySelector('.education-institution')?.textContent).toBe(education.institution);
    expect(root.querySelector('time')?.getAttribute('datetime')).toBe('2024-01-01');
    expect(root.querySelector('app-portfolio-period')?.textContent).toContain('Present');
    expect(root.querySelector('.archive-card-media, .education-grade')).toBeNull();
  });

  it('omits the range separator if no end date is available for a past record', () => {
    fixture.componentRef.setInput('education', { ...education, isCurrent: false, grade: '4.5' });
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-portfolio-period')?.textContent?.trim()).toBe('2024');
    expect(root.querySelector('.education-grade')?.textContent?.trim()).toBe('Grade: 4.5');
  });
});
