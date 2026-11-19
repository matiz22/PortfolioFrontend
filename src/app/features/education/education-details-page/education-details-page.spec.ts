import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import type { Education } from '../../../core/models/education';
import { SeoService } from '../../../core/services/seo.service';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { CaseHeroCover } from '../../../shared/portfolio/case-hero-cover';
import { PortfolioPeriod } from '../../../shared/portfolio/portfolio-period';
import { EducationDetailsPage } from './education-details-page';

describe('EducationDetailsPage', () => {
  let fixture: ComponentFixture<EducationDetailsPage>;
  let root: HTMLElement;
  let routeData: BehaviorSubject<{ educationState: ApiState<Education> }>;
  const date = new Date('2020-01-01');
  const skill = (id: number, name: string) => ({
    id, name, icon: '', proficiencyId: null, order: id, createdAt: date, updatedAt: date,
    pivot: { realizationId: 1, skillId: id },
  });
  const education: Education = {
    id: 1,
    slug: 'software-engineering',
    degree: 'Bachelor of Science',
    institution: 'Example University',
    fieldOfStudy: 'Software Engineering',
    grade: '4.5',
    startDate: date,
    endDate: new Date('2024-06-30'),
    isCurrent: false,
    description: '## Academic work',
    thumbnail: null,
    order: 0,
    createdAt: date,
    updatedAt: date,
    technologies: [{ id: 1, name: 'TypeScript', order: 1 }],
    skills: [skill(1, 'TypeScript'), skill(2, 'Research')],
    homePage: true,
    published: true,
    seoEnabled: true,
    metaTitle: null,
    metaDescription: null,
  };

  beforeEach(async () => {
    routeData = new BehaviorSubject({ educationState: ApiState.success(education) });
    await TestBed.configureTestingModule({
      imports: [EducationDetailsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData.value }, data: routeData } },
        { provide: SeoService, useValue: { updateMeta: jasmine.createSpy('updateMeta') } },
      ],
    }).overrideComponent(EducationDetailsPage, {
      set: { imports: [ImageUrlPipe, PortfolioPeriod, CaseHeroCover], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();
    fixture = TestBed.createComponent(EducationDetailsPage);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('keeps academic details in the hero and groups skills and tech in a glass panel', () => {
    expect(root.querySelector('app-grain-gradient')?.getAttribute('chapter')).toBe('education');
    expect(root.querySelector('.case-back')?.textContent?.trim()).toBe('Back to Education');
    expect(root.querySelector('h1')?.textContent).toBe(education.degree);
    expect(Array.from(root.querySelectorAll('time'), (time) => time.textContent)).toEqual(['2020', '2024']);
    expect(root.querySelector('[data-case-actions]')?.textContent).toContain('Grade: 4.5');
    const panel = root.querySelector('.case-facts.glass.home-glass')!;
    expect(Array.from(panel.querySelectorAll('h2'), (heading) => heading.textContent?.trim())).toEqual(['Skills', 'Tech stack']);
    expect(Array.from(panel.querySelectorAll('li'), (pill) => pill.textContent?.trim())).toEqual(['Research', 'TypeScript']);
    expect(panel.compareDocumentPosition(root.querySelector('.case-story')!) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(root.querySelector('.case-story h2, .case-hero-cover, .case-screenshots')).toBeNull();
  });

  it('uses the thumbnail as a hero cover when the studies have artwork', () => {
    routeData.next({ educationState: ApiState.success({ ...education, thumbnail: 'cover.webp' }) });
    fixture.detectChanges();
    expect(root.querySelector('.case-hero-cover img')).toBeTruthy();
    expect(root.querySelector('.case-preview')).toBeNull();
  });

  it('shows Present for current studies and omits absent grade, skills, and story', () => {
    routeData.next({
      educationState: ApiState.success({
        ...education, isCurrent: true, endDate: null, grade: null, description: '', skills: [], technologies: [],
      }),
    });
    fixture.detectChanges();
    expect(root.querySelector('app-portfolio-period')?.textContent).toContain('Present');
    expect(root.querySelector('[data-case-actions]')?.textContent).not.toContain('Grade');
    expect(root.querySelector('.case-sections')).toBeNull();
  });
});
