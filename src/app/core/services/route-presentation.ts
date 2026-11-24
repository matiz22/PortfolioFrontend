import { inject, Injectable } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SeoData, SeoService } from './seo.service';

/** Document state follows successful navigation, including cached view attachment. */
@Injectable({ providedIn: 'root' })
export class RoutePresentation {
  private readonly router = inject(Router);
  private readonly viewport = inject(ViewportScroller);
  private readonly seo = inject(SeoService);

  constructor() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => this.update());
    this.update();
  }

  private update(): void {
    let route = this.router.routerState.snapshot.root;
    for (let child = route.children.find((item) => item.outlet === PRIMARY_OUTLET);
      child; child = route.children.find((item) => item.outlet === PRIMARY_OUTLET)) {
      route = child;
    }
    const offset: unknown = route.data['anchorOffset'];
    this.viewport.setOffset([0, typeof offset === 'number' && Number.isFinite(offset) ? offset : 30]);
    // The existing `seo` resolver returns void under the same key as static data.
    // Read its route configuration so resolved data cannot hide the declaration.
    const seo: SeoData | undefined = route.routeConfig?.data?.['seo'];
    this.seo.updateAlternateLinks(seo?.alternates);
  }
}
