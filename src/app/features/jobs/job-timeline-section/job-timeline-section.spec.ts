import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { JobSummary } from '../../../core/models/summary/job';
import { JobsService } from '../../../core/services/jobs.service';
import { JobTimelineSection } from './job-timeline-section';

describe('JobTimelineSection', () => {
  let fixture: ComponentFixture<JobTimelineSection>;
  let state: BehaviorSubject<ApiState<JobSummary[]>>;
  let root: HTMLElement;

  const job: JobSummary = {
    id: 1,
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    shortDesc: 'Building web applications.',
    companyName: 'Example Company',
    location: 'Remote',
    startDate: new Date(2024, 0, 1),
    endDate: null,
    isCurrent: true,
    thumbnail: '',
    homePage: true,
    published: true,
    order: 1,
    technologies: [{ id: 1, name: 'Angular' }],
    skills: [{ id: 1, name: 'Accessibility' }],
  };

  beforeEach(async () => {
    state = new BehaviorSubject<ApiState<JobSummary[]>>(ApiState.loading());
    await TestBed.configureTestingModule({
      imports: [JobTimelineSection],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: JobsService, useValue: { getHomeSummaryItems: () => state.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobTimelineSection);
    root = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    state.complete();
  });

  it('announces loading without rendering timeline entries', () => {
    expect(root.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Loading experience');
    expect(root.querySelector('.jobs-track')).toBeNull();
  });

  it('keeps the footer in the stage and the skip destination outside the pinned section', () => {
    expect(root.querySelector('.jobs-stage .jobs-bottom .jobs-footer')).not.toBeNull();
    const end = root.querySelector('#experience-end');
    expect(end).not.toBeNull();
    expect(end?.closest('.jobs-section')).toBeNull();
    expect(root.querySelector('.jobs-skip')?.getAttribute('href')).toBe('#experience-end');
  });

  it('renders API order, accessible role links, dates, and current status', async () => {
    state.next(ApiState.success([
      job,
      { ...job, id: 2, slug: 'previous-role', title: 'Previous Role', isCurrent: false,
        startDate: new Date(2022, 0, 1), endDate: new Date(2023, 11, 1) },
    ]));
    await fixture.whenStable();

    const entries = root.querySelectorAll('.jobs-entry');
    expect(entries.length).toBe(2);
    const link = entries[0].querySelector<HTMLAnchorElement>('.jobs-card')!;
    expect(link.getAttribute('href')).toBe('/job/frontend-developer');
    expect(link.getAttribute('aria-labelledby')).toBe('experience-role-1');
    expect(root.querySelector('#experience-role-1')?.textContent).toBe(job.title);
    expect(entries[0].querySelector('.jobs-present')?.textContent).toBe('Present');
    expect(entries[0].querySelector('time')?.getAttribute('datetime')).toBe('2024-01');
    expect(entries[1].querySelectorAll('time').length).toBe(2);
    expect(entries[1].querySelector('.jobs-present')).toBeNull();
    expect(root.querySelector('[aria-busy="false"]')).not.toBeNull();
  });

  it('keeps tag previews compact and indicates additional tags', async () => {
    state.next(ApiState.success([{
      ...job,
      technologies: Array.from({ length: 7 }, (_, id) => ({ id, name: `Technology ${id}` })),
      skills: Array.from({ length: 5 }, (_, id) => ({ id, name: `Skill ${id}` })),
    }]));
    await fixture.whenStable();

    expect(root.querySelectorAll('.jobs-technologies .jobs-tag').length).toBe(5);
    expect(root.querySelector('.jobs-technologies .jobs-tag-more')?.textContent?.trim()).toBe('+3');
    expect(root.querySelectorAll('.jobs-skills .jobs-tag').length).toBe(4);
    expect(root.querySelector('.jobs-skills .jobs-tag-more')?.textContent?.trim()).toBe('+2');
  });

  it('handles empty collections and missing optional dates and tag groups', async () => {
    state.next(ApiState.success([{ ...job, technologies: [], skills: [], location: '',
      isCurrent: false, endDate: null }]));
    await fixture.whenStable();
    expect(root.querySelector('.jobs-tags')).toBeNull();
    expect(root.querySelector('.jobs-location')).toBeNull();
    expect(root.querySelector('.jobs-dates')?.textContent).not.toContain('null');

    state.next(ApiState.success([]));
    await fixture.whenStable();
    expect(root.querySelector('.jobs-track')).toBeNull();
    expect(root.querySelector('.jobs-state')?.textContent).toContain('No work experience');
  });

  it('shows a useful error and retains the full experience link', async () => {
    state.next(ApiState.error('Offline'));
    await fixture.whenStable();
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Error loading jobs');
    expect(root.querySelector('.jobs-viewall')?.getAttribute('href')).toBe('/jobs');
  });
});
