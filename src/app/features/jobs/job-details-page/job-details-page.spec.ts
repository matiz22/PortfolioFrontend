import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import type { Job } from '../../../core/models/job';
import { SeoService } from '../../../core/services/seo.service';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { CaseHeroCover } from '../../../shared/portfolio/case-hero-cover';
import { PortfolioPeriod } from '../../../shared/portfolio/portfolio-period';
import { JobDetailsPage } from './job-details-page';

describe('JobDetailsPage', () => {
  let fixture: ComponentFixture<JobDetailsPage>;
  let root: HTMLElement;
  let routeData: BehaviorSubject<{ jobState: ApiState<Job> }>;
  const date = new Date('2021-01-01');
  const skill = (id: number, name: string) => ({
    id, name, icon: '', proficiencyId: null, order: id, createdAt: date, updatedAt: date,
    pivot: { realizationId: 1, skillId: id },
  });
  const job: Job = {
    id: 1, slug: 'software-engineer', title: 'Software Engineer', companyName: 'Example Studio',
    location: 'Warsaw', startDate: date, endDate: new Date('2024-06-30'), isCurrent: false,
    description: '## Role responsibilities', thumbnail: '', order: 0, createdAt: date, updatedAt: date,
    homePage: true, published: true, seoEnabled: true, metaTitle: null, metaDescription: null,
    technologies: [{ id: 1, name: 'Angular', order: 1 }],
    skills: [skill(1, 'Angular'), skill(2, 'Accessibility')],
  };

  beforeEach(async () => {
    routeData = new BehaviorSubject({ jobState: ApiState.success(job) });
    await TestBed.configureTestingModule({
      imports: [JobDetailsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData.value }, data: routeData } },
        { provide: SeoService, useValue: { updateMeta: jasmine.createSpy('updateMeta') } },
      ],
    }).overrideComponent(JobDetailsPage, {
      set: { imports: [ImageUrlPipe, PortfolioPeriod, CaseHeroCover], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(JobDetailsPage);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows the role and period in the hero, with unique tags in a glass panel', () => {
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('experience');
    expect(root.querySelector('.case-back')?.textContent?.trim()).toBe('Back to Experience');
    expect(root.querySelector('h1')?.textContent).toBe(job.title);
    expect(root.querySelector('.case-summary')?.textContent).toBe(job.location);
    expect(Array.from(root.querySelectorAll('time'), (time) => time.textContent)).toEqual(['January 2021', 'June 2024']);
    const panel = root.querySelector('.case-facts.glass.home-glass')!;
    expect(Array.from(panel.querySelectorAll('h2'), (heading) => heading.textContent?.trim())).toEqual(['Skills', 'Tech stack']);
    expect(Array.from(panel.querySelectorAll('li'), (pill) => pill.textContent?.trim())).toEqual(['Accessibility', 'Angular']);
    expect(panel.compareDocumentPosition(root.querySelector('.case-story')!) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(root.querySelector('.case-story h2, .case-hero-cover, .case-screenshots')).toBeNull();
  });

  it('uses the thumbnail as a hero cover when the role has artwork', () => {
    routeData.next({ jobState: ApiState.success({ ...job, thumbnail: 'cover.webp' }) });
    fixture.detectChanges();
    expect(root.querySelector('.case-hero-cover img')).toBeTruthy();
    expect(root.querySelector('.case-preview')).toBeNull();
  });

  it('shows Present only for a current role and omits empty content', () => {
    routeData.next({
      jobState: ApiState.success({
        ...job, isCurrent: true, endDate: null, location: '', description: '', skills: [], technologies: [],
      }),
    });
    fixture.detectChanges();
    expect(root.querySelector('app-portfolio-period')?.textContent).toContain('Present');
    expect(root.querySelector('.case-summary, .case-sections')).toBeNull();
  });
});
