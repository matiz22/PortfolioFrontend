import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { EducationSection } from './education-section';
import { EducationService } from '../../../core/services/education.service';
import { EducationSummary } from '../../../core/models/summary/education';
import { ApiState } from '../../../core/models/api.state';

describe('EducationSection', () => {
  let component: EducationSection;
  let fixture: ComponentFixture<EducationSection>;
  let response: Subject<ApiState<EducationSummary[]>>;
  let service: jasmine.SpyObj<EducationService>;

  const degree: EducationSummary = {
    id: 1,
    slug: 'computer-science',
    institution: 'Example University',
    degree: 'Bachelor of Engineering',
    fieldOfStudy: 'Computer Science',
    grade: '5.0',
    description: 'An academic foundation in software engineering.',
    startDate: new Date('2019-10-01'),
    endDate: new Date('2023-06-01'),
    isCurrent: false,
    thumbnail: null,
    homePage: true,
    published: true,
    order: 1,
    technologies: [],
    skills: [],
  };

  function render(state: ApiState<EducationSummary[]>): HTMLElement {
    response.next(state);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    response = new Subject<ApiState<EducationSummary[]>>();
    service = jasmine.createSpyObj<EducationService>('EducationService', ['getHomeSummaryItems']);
    service.getHomeSummaryItems.and.returnValue(response);

    await TestBed.configureTestingModule({
      imports: [EducationSection],
      providers: [
        provideRouter([]),
        { provide: EducationService, useValue: service },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(EducationSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    response.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(service.getHomeSummaryItems).toHaveBeenCalledTimes(1);
  });

  it('reserves space for the cards and announces loading', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.education-record')?.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Loading academic record');
    expect(root.querySelector('.education-loading')).not.toBeNull();
  });

  it('presents one full-width card per qualification in API order', () => {
    const root = render(ApiState.success([
      { ...degree, id: 2, slug: 'masters', degree: 'Master of Science', thumbnail: '/example.png' },
      degree,
    ]));
    const headings = root.querySelectorAll('.education-degree');
    const links = root.querySelectorAll('.education-detail-link');
    expect(headings[0].textContent).toBe('Master of Science');
    expect(headings[1].textContent).toBe(degree.degree);
    expect(links[0].getAttribute('href')).toBe('/education/masters');
    expect(links[1].getAttribute('href')).toBe('/education/computer-science');
    expect(root.querySelector('.education-institution')?.textContent).toBe(degree.institution);
    expect(root.querySelector('.education-subject')?.textContent).toBe(degree.fieldOfStudy);
    expect(root.querySelector('.education-grade')?.textContent).toContain('5.0');
    expect(root.querySelectorAll('.education-card').length).toBe(2);
    expect(root.querySelectorAll('.education-media img').length).toBe(1);
    expect(root.querySelector('.education-record')?.getAttribute('aria-busy')).toBe('false');
  });

  it('labels the card and detail link with the field and degree', () => {
    const root = render(ApiState.success([degree]));
    expect(root.querySelector('#education-title-1')?.textContent).toBe(degree.degree);
    expect(root.querySelector('.education-detail-link')?.getAttribute('aria-labelledby'))
      .toBe('education-explore-1 education-title-1');
    expect(root.querySelector('article')?.getAttribute('aria-labelledby')).toBe('education-title-1');
    expect(root.querySelector('.education-media img')?.getAttribute('alt')).toBe('');
  });

  it('shows at most six technology tags with a summarised remainder', () => {
    const technologies = Array.from({ length: 8 }, (unused, number) => ({ id: number + 1, name: `Tech ${number + 1}` }));
    const root = render(ApiState.success([{ ...degree, technologies }]));
    expect(root.querySelectorAll('.education-tags li').length).toBe(7);
    expect(root.querySelector('.education-tags-more')?.textContent).toBe('2+');
  });

  it('hides the technology list when a degree has none', () => {
    const root = render(ApiState.success([{ ...degree, technologies: [] }]));
    expect(root.querySelector('.education-tech')).toBeNull();
    expect(root.querySelector('.education-tags')).toBeNull();
  });

  it('uses semantic dates and identifies ongoing study without inventing an end date', () => {
    const root = render(ApiState.success([{ ...degree, isCurrent: true, endDate: null }]));
    expect(root.querySelectorAll('time').length).toBe(1);
    expect(root.querySelector('time')?.getAttribute('datetime')).toBe('2019-10');
    expect(root.querySelector('.education-current')?.textContent).toContain('Present');
  });

  it('omits missing optional information and an unknown end date', () => {
    const root = render(ApiState.success([{
      ...degree, fieldOfStudy: '', grade: null, endDate: null,
    }]));
    expect(root.querySelector('.education-subject')?.textContent).toBe(degree.degree);
    expect(root.querySelector('.education-degree')).toBeNull();
    expect(root.querySelector('.education-grade')).toBeNull();
    expect(root.querySelector('.education-detail-link')?.hasAttribute('aria-describedby')).toBeFalse();
    expect(root.querySelector('.education-current')).toBeNull();
    expect(root.querySelector('.education-dates')?.textContent).not.toContain('—');
    expect(root.querySelectorAll('time').length).toBe(1);
  });

  it('renders the empty state and preserves the catalogue link', () => {
    const root = render(ApiState.success([]));
    expect(root.querySelector('.education-state')?.textContent).toContain('New chapters');
    expect(root.querySelector('.education-footer a')?.getAttribute('href')).toBe('/education');
    expect(root.querySelector('.education-entry')).toBeNull();
  });

  it('shows a friendly error instead of raw backend details', () => {
    const root = render(ApiState.error('Private backend information'));
    expect(root.querySelector('[role="status"]')?.textContent).toContain('could not be loaded');
    expect(root.textContent).not.toContain('Private backend information');
  });

  it('updates the cards when API data changes', () => {
    render(ApiState.success([degree, { ...degree, id: 2, slug: 'masters' }]));
    const root = render(ApiState.success([{ ...degree, degree: 'Inżynier' }]));
    expect(root.querySelectorAll('.education-entry').length).toBe(1);
    expect(root.querySelectorAll('.education-card').length).toBe(1);
    expect(root.querySelector('.education-degree')?.textContent).toBe('Inżynier');
  });
});
