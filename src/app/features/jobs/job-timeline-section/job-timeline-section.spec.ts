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

  it('groups the intro and work history CTA in one glass panel above the timeline', () => {
    const header = root.querySelector('.jobs-header')!;
    const link = header.querySelector('.jobs-viewall');

    expect(header.classList).toContain('home-copy-panel');
    expect(header.querySelector('#experience-heading')).not.toBeNull();
    expect(header.querySelector('.jobs-intro')?.classList).not.toContain('glass');
    expect(link?.classList).toContain('section-action-cta');
    expect(link?.getAttribute('href')).toBe('/jobs');
    expect(header.nextElementSibling?.classList).toContain('jobs-viewport');
  });

  it('keeps next-section navigation in the stage without archive or scroll controls', () => {
    expect(root.querySelector('.jobs-stage app-section-footer.jobs-bottom')).not.toBeNull();
    expect(root.querySelector('.jobs-bottom .jobs-viewall')).toBeNull();
    expect(root.querySelector('.jobs-scroll-guide, .jobs-skip, #experience-end')).toBeNull();
    expect(root.textContent).not.toContain('Scroll to follow the journey');
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
    expect(entries[0].querySelector('.jobs-present')?.textContent).toBe('to present');
    expect(entries[0].querySelector('time')?.getAttribute('datetime')).toBe('2024-01');
    expect(entries[1].querySelectorAll('time').length).toBe(2);
    expect(entries[1].querySelector('.jobs-present')).toBeNull();
    expect(entries[1].querySelector('.jobs-dates span')?.textContent).toBe('to');
    expect(root.querySelector('[aria-busy="false"]')).not.toBeNull();
  });

  it('shows every technology and skill as a pill', async () => {
    const technologies = Array.from({ length: 7 }, (_, id) => ({ id, name: `Technology ${id}` }));
    const skills = Array.from({ length: 5 }, (_, id) => ({ id, name: `Skill ${id}` }));
    state.next(ApiState.success([{
      ...job, technologies, skills,
    }]));
    await fixture.whenStable();

    expect(Array.from(root.querySelectorAll('.jobs-technologies li'), pill => pill.textContent))
      .toEqual(technologies.map(tech => tech.name));
    expect(Array.from(root.querySelectorAll('.jobs-skills li'), pill => pill.textContent))
      .toEqual(skills.map(skill => skill.name));
  });

  it('brings a partly visible keyboard-focused role into the native rail', async () => {
    state.next(ApiState.success([job, { ...job, id: 2, slug: 'second-role' }]));
    await fixture.whenStable();
    const viewport = root.querySelector<HTMLElement>('.jobs-viewport')!;
    const role = root.querySelectorAll<HTMLElement>('.jobs-card')[1];
    Object.defineProperties(viewport, {
      clientWidth: { value: 320 },
      scrollWidth: { value: 544 },
    });
    viewport.style.overflowX = 'auto';
    viewport.style.scrollPaddingLeft = '24px';
    spyOn(role, 'matches').and.callThrough().withArgs('.jobs-card:focus-visible').and.returnValue(true);
    spyOn(role, 'getBoundingClientRect').and.returnValue(new DOMRect(292, 0, 252, 150));
    spyOn(viewport, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 320, 220));
    const scroll = spyOn(viewport, 'scrollBy');

    role.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(scroll.calls.allArgs() as unknown[]).toEqual([[{ left: 268, behavior: 'instant' }]]);
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
