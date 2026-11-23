import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiState } from '../../core/models/api.state';
import { SocialLinksService } from '../../core/services/social.links.service';

import { PrivacyPolicy } from './privacy-policy';

describe('PrivacyPolicy', () => {
  let fixture: ComponentFixture<PrivacyPolicy>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicy],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'en' },
        { provide: SocialLinksService, useValue: { getAll: () => of(ApiState.success([])) } },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PrivacyPolicy);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('renders the policy Markdown once it loads', async () => {
    http.expectOne('/markdown/privacy-policy.md').flush('# Privacy Policy');
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('markdown h1')?.textContent).toBe('Privacy Policy');
  });
});
