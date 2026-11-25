import { Component } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouteReuseStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CustomRouteReuseStrategy } from '../../route.reuse.strategy';
import { RoutePresentation } from './route-presentation';

@Component({ selector: 'app-test-cached-home', template: '<h1>Cached home</h1>' })
class CachedHome {}
@Component({ selector: 'app-test-other-page', template: '<h1>Other page</h1>' })
class OtherPage {}

describe('RoutePresentation', () => {
  const alternates = [
    { hreflang: 'pl', href: 'https://malich.dev/' },
    { hreflang: 'en', href: 'https://malich.dev/en/' },
  ];

  afterEach(() => document.head.querySelectorAll('link[data-app-hreflang], link[data-test-alternate]')
    .forEach((link) => link.remove()));

  it('restores route-owned metadata and offsets on cached returns without changing other links', async () => {
    TestBed.configureTestingModule({ providers: [
      provideRouter([
        {
          path: '', component: CachedHome, resolve: { seo: () => undefined },
          data: { reuse: true, anchorOffset: 0, seo: { alternates } },
        },
        { path: 'other', component: OtherPage },
      ]),
      { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    ] });
    const foreign = document.createElement('link');
    foreign.rel = 'alternate';
    foreign.hreflang = 'fr';
    foreign.setAttribute('data-test-alternate', '');
    document.head.appendChild(foreign);
    const offset = spyOn(TestBed.inject(ViewportScroller), 'setOffset');
    TestBed.inject(RoutePresentation);
    const harness = await RouterTestingHarness.create();
    const home = await harness.navigateByUrl('/', CachedHome);
    expect(offset.calls.mostRecent().args[0]).toEqual([0, 0]);
    expect(document.head.querySelectorAll('link[data-app-hreflang]').length).toBe(2);
    await harness.navigateByUrl('/other', OtherPage);
    expect(offset.calls.mostRecent().args[0]).toEqual([0, 30]);
    expect(document.head.querySelectorAll('link[data-app-hreflang]').length).toBe(0);
    expect(await harness.navigateByUrl('/', CachedHome)).toBe(home);
    expect(offset.calls.mostRecent().args[0]).toEqual([0, 0]);
    expect(document.head.querySelectorAll('link[data-app-hreflang]').length).toBe(2);
    expect(foreign.isConnected).toBeTrue();
    await TestBed.inject(Router).navigateByUrl('/#about');
    expect(document.head.querySelectorAll('link[data-app-hreflang]').length).toBe(2);
  });
});
