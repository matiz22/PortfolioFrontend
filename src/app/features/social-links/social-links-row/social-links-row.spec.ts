import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';
import { SocialLinksService } from '../../../core/services/social.links.service';

import { SocialLinksRow } from './social-links-row';

describe('SocialLinksRow', () => {
  let fixture: ComponentFixture<SocialLinksRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLinksRow],
      providers: [{
        provide: SocialLinksService,
        useValue: {
          getAll: () => of(ApiState.success([
            { id: 1, name: 'LinkedIn', url: 'https://linkedin.com/in/example', icon: 'icons/linkedin.svg' },
          ])),
        },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialLinksRow);
    fixture.detectChanges();
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
