import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ApiState } from '../../core/models/api.state';
import { SocialLink } from '../../core/models/social.link';
import { SocialLinksService } from '../../core/services/social.links.service';

import { SocialLinksRow } from './social-links-row';

describe('SocialLinksRow', () => {
  let fixture: ComponentFixture<SocialLinksRow>;
  let state: BehaviorSubject<ApiState<SocialLink[]>>;

  beforeEach(async () => {
    state = new BehaviorSubject<ApiState<SocialLink[]>>(ApiState.success([
      {
        id: 1, name: 'LinkedIn', url: 'https://linkedin.com/in/example', icon: 'icons/linkedin.svg',
        order: 1, createdAt: new Date('2025-01-01'), updatedAt: new Date('2025-01-01'),
      },
    ]));
    await TestBed.configureTestingModule({
      imports: [SocialLinksRow],
      providers: [{
        provide: SocialLinksService,
        useValue: { getAll: () => state.asObservable() },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialLinksRow);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps icon links safe and unfrosted outside the homepage', () => {
    const root: HTMLElement = fixture.nativeElement;
    const link = root.querySelector<HTMLAnchorElement>('a[target="_blank"]')!;
    expect(link.rel).toContain('noopener');
    expect(root.querySelector('.home-glass-chip')).toBeNull();
  });

  it('presents the icon row as one glass chip on the homepage', async () => {
    fixture.componentRef.setInput('glass', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const panel = root.querySelector<HTMLElement>('div.home-glass-chip')!;
    expect(panel).not.toBeNull();
    expect(panel.classList).toContain('glass');
    expect(panel.querySelectorAll('a[target="_blank"]').length).toBe(1);
  });

  it('announces loading instead of leaving the social links area blank', async () => {
    state.next(ApiState.loading());
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-status-announcer [role="status"]')?.textContent)
      .toContain('Loading social links');
    expect(root.querySelector('.social-links-state')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('a')).toBeNull();
  });

  it('announces failures without exposing backend details', async () => {
    const root: HTMLElement = fixture.nativeElement;
    state.next(ApiState.loading());
    await fixture.whenStable();
    const status = root.querySelector('[role="status"]')!;
    state.next(ApiState.error('Sensitive backend error'));
    await fixture.whenStable();

    expect(root.querySelector('[role="status"]')).toBe(status);
    expect(status.textContent?.trim()).toBe('');
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Social links could not be loaded');
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('contact me by email');
    expect(root.textContent).not.toContain('Sensitive backend error');
    expect(root.querySelector('a')).toBeNull();
  });

  it('frosts the Social Links label alongside its icons on the homepage', async () => {
    fixture.componentRef.setInput('glass', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const label = root.querySelector<HTMLElement>('span.home-glass-chip')!;
    expect(label).not.toBeNull();
    expect(label.textContent?.trim()).toBe('Social Links');
    expect(getComputedStyle(label).backdropFilter).toContain('blur(');
    expect(root.querySelectorAll('.home-glass-chip').length).toBe(2);
  });
});
