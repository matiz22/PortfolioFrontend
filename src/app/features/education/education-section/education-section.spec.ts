import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { EducationSection } from './education-section';
import { EducationService } from '../../../core/services/education.service';
import { EducationSummary } from '../../../core/models/summary/education';
import { ApiState } from '../../../core/models/api.state';
import { HomeCopyRegistry } from '../../../shared/animations/home-copy-registry';

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
        HomeCopyRegistry,
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

  it('places the primary academic record link inside the glass intro panel', () => {
    const root = fixture.nativeElement as HTMLElement;
    const header = root.querySelector('.education-header')!;
    const link = header.querySelector('.education-viewall');

    expect(header.classList).toContain('home-copy-panel');
    expect(header.querySelector('#education-heading')).not.toBeNull();
    expect(header.querySelector('p')?.classList).not.toContain('glass');
    expect(link?.classList).toContain('section-action-cta');
    expect(link?.getAttribute('href')).toBe('/education');
    expect(header.nextElementSibling?.classList).toContain('education-record');
  });

  it('shares the card copy configuration without replacing retained registrations', async () => {
    const registry = TestBed.inject(HomeCopyRegistry);
    const add = jasmine.createSpy('add');
    const remove = jasmine.createSpy('remove');
    const unsubscribe = registry.subscribe({ add, remove });
    const secondDegree = { ...degree, id: 2, slug: 'masters' };
    response.next(ApiState.success([degree, secondDegree]));
    await fixture.whenStable();
    expect(add).toHaveBeenCalledTimes(3);
    const cardConfigs = add.calls.allArgs()
      .map(([registration]) => registration.config)
      .filter(config => config.focusScope === '.education-card');
    expect(cardConfigs.length).toBe(2);
    expect(cardConfigs[0]).toBe(cardConfigs[1]);
    const root = fixture.nativeElement as HTMLElement;
    expect(getComputedStyle(root.querySelector('.education-motion')!).willChange).toBe('auto');
    expect(getComputedStyle(root.querySelector('.education-card')!).willChange).toBe('auto');

    response.next(ApiState.success([{ ...degree, degree: 'Updated degree' }, secondDegree]));
    await fixture.whenStable();
    expect(add).toHaveBeenCalledTimes(3);
    expect(remove).not.toHaveBeenCalled();
    unsubscribe();
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
    expect(root.querySelectorAll('.education-card > .education-cover-image').length).toBe(1);
    expect(root.querySelector('.education-record')?.getAttribute('aria-busy')).toBe('false');
  });

  it('labels the card and detail link with the field and degree', () => {
    const root = render(ApiState.success([{ ...degree, thumbnail: '/example.png' }]));
    expect(root.querySelector('#education-title-1')?.textContent).toBe(degree.degree);
    expect(root.querySelector('.education-detail-link')?.getAttribute('aria-labelledby'))
      .toBe('education-explore-1 education-title-1');
    const link = root.querySelector('.education-detail-link')!;
    expect(link.querySelector('[aria-hidden]')).toBeNull();
    expect(getComputedStyle(link).textDecorationLine).toBe('underline');
    expect(root.querySelector('article')?.getAttribute('aria-labelledby')).toBe('education-title-1');
    expect(root.querySelector('.education-cover-image')?.getAttribute('alt')).toBe('');
  });

  it('extends the existing detail link over the whole card without adding another tab stop', () => {
    const root = render(ApiState.success([{ ...degree, thumbnail: '/example.png' }]));
    const card = root.querySelector('.education-card')!;
    const links = card.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('/education/computer-science');
    expect(links[0].tabIndex).toBe(0);
    expect(card.hasAttribute('tabindex')).toBeFalse();
    expect(getComputedStyle(card).position).toBe('relative');
    const target = getComputedStyle(links[0], '::after');
    expect(target.position).toBe('absolute');
    expect([target.top, target.right, target.bottom, target.left]).toEqual(['0px', '0px', '0px', '0px']);
  });

  it('shows every technology without a summarised remainder', () => {
    const technologies = Array.from({ length: 8 }, (unused, number) => ({ id: number + 1, name: `Tech ${number + 1}` }));
    const root = render(ApiState.success([{ ...degree, technologies }]));
    expect(Array.from(root.querySelectorAll('.education-tags li'), pill => pill.textContent))
      .toEqual(technologies.map(tech => tech.name));
  });

  it('shows skills even when the degree has no technologies', () => {
    const root = render(ApiState.success([{ ...degree, skills: [{ id: 1, name: 'Research' }] }]));
    expect(root.querySelector('.education-tags[aria-label="Technologies"]')).toBeNull();
    expect(root.querySelector('.education-skills[aria-label="Skills"] .home-metadata-pill')?.textContent)
      .toBe('Research');
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
    expect(root.querySelector('.education-current')?.textContent).toBe('to present');
  });

  it('uses a word rather than punctuation between study dates', () => {
    const root = render(ApiState.success([degree]));
    expect(root.querySelectorAll('.education-dates time').length).toBe(2);
    expect(root.querySelector('.education-dates span')?.textContent).toBe('to');
  });

  it('omits missing optional information and an unknown end date', () => {
    const root = render(ApiState.success([{
      ...degree, fieldOfStudy: '', grade: null, endDate: null,
    }]));
    expect(root.querySelector('.education-subject')).toBeNull();
    expect(root.querySelector('.education-degree')?.textContent).toBe(degree.degree);
    expect(root.querySelector('.education-grade')).toBeNull();
    expect(root.querySelector('.education-detail-link')?.hasAttribute('aria-describedby')).toBeFalse();
    expect(root.querySelector('.education-current')).toBeNull();
    expect(root.querySelector('.education-dates span')).toBeNull();
    expect(root.querySelectorAll('time').length).toBe(1);
  });

  it('keeps the card without a decorative image when no thumbnail is available', () => {
    const root = render(ApiState.success([degree]));
    expect(root.querySelector('.education-cover-image')).toBeNull();
    expect(root.querySelector('.education-record-label')).toBeNull();
    expect(root.textContent).not.toContain('The learning continues.');
  });

  it('places the thumbnail behind the whole card and keeps its height if the image fails', () => {
    const root = render(ApiState.success([{ ...degree, thumbnail: '/example.png' }]));
    const card = root.querySelector<HTMLElement>('.education-card')!;
    const image = card.querySelector<HTMLImageElement>(':scope > .education-cover-image')!;
    const height = card.offsetHeight;
    expect(getComputedStyle(image).position).toBe('absolute');
    expect(getComputedStyle(image).objectFit).toBe('cover');
    expect(getComputedStyle(card, '::before').backgroundImage).toContain('linear-gradient');

    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(card.querySelector('.education-cover-image')).toBeNull();
    expect(card.querySelector('.education-degree')?.textContent).toBe(degree.degree);
    expect(card.offsetHeight).toBe(height);
  });

  it('renders the empty state and preserves the catalogue link', () => {
    const root = render(ApiState.success([]));
    expect(root.querySelector('.education-state')?.textContent).toContain('New chapters');
    expect(root.querySelector('.education-viewall')?.getAttribute('href')).toBe('/education');
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
