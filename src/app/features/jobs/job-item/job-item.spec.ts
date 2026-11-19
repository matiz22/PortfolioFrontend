import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Job } from '../../../core/models/job';
import { JobItem } from './job-item';

describe('JobItem', () => {
  let fixture: ComponentFixture<JobItem>;
  const date = new Date('2024-01-01');
  const job: Job = {
    id: 1, slug: 'software-engineer', title: 'Software Engineer', companyName: 'Example Studio',
    location: 'Warsaw', startDate: date, endDate: null, isCurrent: true, thumbnail: '',
    description: '', order: 0, createdAt: date, updatedAt: date,
    homePage: true, published: true, seoEnabled: true, metaTitle: null, metaDescription: null,
    technologies: [{ id: 1, name: 'Angular', order: 0 }], skills: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JobItem], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(JobItem);
    fixture.componentRef.setInput('job', job);
    fixture.detectChanges();
  });

  it('shows the role, employer and localized dates without an empty image frame', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/job/software-engineer');
    expect(root.querySelector('h2')?.textContent).toBe(job.title);
    expect(root.querySelector('.job-company')?.textContent).toBe(job.companyName);
    expect(root.querySelector('.archive-card-summary')?.textContent).toBe(job.location);
    expect(root.querySelector('time')?.getAttribute('datetime')).toBe('2024-01-01');
    expect(root.querySelector('time')?.textContent).toBe('Jan 2024');
    expect(root.querySelector('app-portfolio-period')?.textContent).toContain('Present');
    expect(root.querySelector('.archive-card-media')).toBeNull();
  });

  it('omits the date range and location when an older entry has neither', () => {
    fixture.componentRef.setInput('job', { ...job, isCurrent: false, location: '' });
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-portfolio-period')?.textContent?.trim()).toBe('Jan 2024');
    expect(root.querySelector('.archive-card-summary')).toBeNull();
  });
});
