import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { Realization } from '../../../core/models/realization';
import { SeoService } from '../../../core/services/seo.service';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { RealizationDetailsPage } from './realization-details-page';

describe('RealizationDetailsPage', () => {
  let fixture: ComponentFixture<RealizationDetailsPage>;
  let root: HTMLElement;
  let realization: Realization;
  let routeData: BehaviorSubject<{ realizationState: ApiState<Realization> }>;

  beforeEach(async () => {
    const date = new Date(0);
    realization = {
      id: 1,
      slug: 'case-study',
      title: 'A project for a client',
      clientName: 'A client',
      clientLogo: '',
      clientUrl: 'https://example.com',
      companyLink: null,
      location: 'Warsaw',
      shortDesc: 'A concise introduction.',
      description: '# How the project was built',
      thumbnail: '',
      screenshots: ['gallery.png'],
      technologies: [{ id: 2, name: 'Angular', order: 0 }],
      skills: [
        { id: 3, name: 'Angular', icon: '', proficiencyId: null, order: 0, createdAt: date, updatedAt: date, pivot: { realizationId: 1, skillId: 3 } },
        { id: 4, name: 'Design systems', icon: '', proficiencyId: null, order: 1, createdAt: date, updatedAt: date, pivot: { realizationId: 1, skillId: 4 } },
      ],
      createdAt: date,
      updatedAt: date,
      order: 0,
      homePage: true,
      published: true,
      seoEnabled: true,
      metaTitle: null,
      metaDescription: null,
    };
    routeData = new BehaviorSubject({ realizationState: ApiState.success(realization) });

    await TestBed.configureTestingModule({
      imports: [RealizationDetailsPage],
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: routeData.value }, data: routeData } },
        { provide: SeoService, useValue: { updateMeta: jasmine.createSpy('updateMeta') } },
      ],
    }).overrideComponent(RealizationDetailsPage, {
      set: { imports: [ImageUrlPipe], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();

    fixture = TestBed.createComponent(RealizationDetailsPage);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('orders the stacked layout as hero, skills and tech, story, then gallery', () => {
    expect(root.querySelector('.case-hero a')?.textContent?.trim()).toBe('All Realizations');
    expect(root.querySelector('h1')?.textContent).toBe(realization.title);
    const facts = root.querySelector('.case-facts')!;
    const story = root.querySelector('.case-story')!;
    const gallery = root.querySelector('.case-screenshots')!;
    expect(facts.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(story.compareDocumentPosition(gallery) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(Array.from(root.querySelectorAll('h2'), (title) => title.textContent?.trim())).toEqual([
      'Skills used', 'Tech stack', 'Project screenshots',
    ]);
  });

  it('renders each tag only once inside a shared glass panel', () => {
    expect(root.querySelector('.case-hero .case-chip')).toBeNull();
    const panel = root.querySelector<HTMLElement>('.case-facts.glass.home-glass.home-copy-panel')!;
    expect(getComputedStyle(panel).backdropFilter).toContain('blur(');
    expect(Array.from(panel.querySelectorAll('li'), (tag) => tag.textContent?.trim())).toEqual([
      'Design systems', 'Angular',
    ]);
  });

  it('omits sections with no project content', () => {
    routeData.next({
      realizationState: ApiState.success({
        ...realization, description: ' ', technologies: [], skills: [], screenshots: [],
      }),
    });
    fixture.detectChanges();
    expect(root.querySelector('.case-sections')).toBeNull();
  });
});
