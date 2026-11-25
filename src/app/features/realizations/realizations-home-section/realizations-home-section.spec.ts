import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { RealizationSummary } from '../../../core/models/summary/realization';
import { RealizationsService } from '../../../core/services/realizations.service';
import { RealizationsHomeSection } from './realizations-home-section';

describe('RealizationsHomeSection', () => {
  let fixture: ComponentFixture<RealizationsHomeSection>;
  let response: Subject<ApiState<RealizationSummary[]>>;

  const realization: RealizationSummary = {
    id: 1,
    slug: 'company-website',
    title: 'Company website',
    shortDesc: 'A fast, accessible website for a local business.',
    clientName: 'Example Company',
    clientUrl: 'https://example.com',
    location: 'Poland',
    thumbnail: '',
    homePage: true,
    published: true,
    order: 1,
    technologies: [],
    skills: [],
  };

  async function render(state: ApiState<RealizationSummary[]>): Promise<HTMLElement> {
    response.next(state);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  beforeEach(async () => {
    response = new Subject<ApiState<RealizationSummary[]>>();
    await TestBed.configureTestingModule({
      imports: [RealizationsHomeSection],
      providers: [
        provideRouter([]),
        {
          provide: RealizationsService,
          useValue: { getHomeSummaryItems: () => response.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RealizationsHomeSection);
    await fixture.whenStable();
  });

  afterEach(() => response.complete());

  it('announces loading while keeping both skeletons decorative', () => {
    const root: HTMLElement = fixture.nativeElement;
    const status = root.querySelector('app-status-announcer [role="status"]')!;
    expect(status.textContent).toContain('Loading client work');
    expect(root.querySelectorAll('.realizations-skeleton[aria-hidden="true"]').length).toBe(2);
    expect(root.querySelector('app-realization-showcase-card')).toBeNull();
  });

  it('renders successful results and clears the announcement in the same live region', async () => {
    const status = fixture.nativeElement.querySelector('[role="status"]')!;
    expect(status.textContent).toContain('Loading client work');
    const root = await render(ApiState.success([realization]));
    const cards = root.querySelectorAll('app-realization-showcase-card');
    expect(cards.length).toBe(1);
    const link = cards[0]?.querySelector('.realization-card-title-link');
    expect(link?.textContent).toContain(realization.title);
    expect(link?.getAttribute('href')).toBe('/realization/company-website');
    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent?.trim()).toBe('');
    expect(root.querySelector('.realizations-skeleton, .realizations-state')).toBeNull();
  });

  it('announces an empty result in the same live region', async () => {
    const status = fixture.nativeElement.querySelector('[role="status"]');
    const root = await render(ApiState.success([]));
    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent).toContain('No realizations to show yet');
    const message = root.querySelector('.realizations-state')!;
    expect(message.textContent).toContain('No realizations to show yet');
    expect(message.hasAttribute('role')).toBeFalse();
    expect(root.querySelector('.realizations-skeleton, app-realization-showcase-card')).toBeNull();
  });

  it('announces API errors without exposing backend details', async () => {
    const status = fixture.nativeElement.querySelector('[role="status"]');
    const root = await render(ApiState.error('Sensitive backend error'));
    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent?.trim()).toBe('');
    expect(root.querySelector('.realizations-state[role="alert"]')?.textContent)
      .toContain('Realizations could not be loaded');
    expect(root.querySelector('.realizations-skeleton, app-realization-showcase-card')).toBeNull();
    expect(root.textContent).not.toContain('Sensitive backend error');
  });
});
