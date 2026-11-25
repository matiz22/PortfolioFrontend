import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withInMemoryScrolling, withViewTransitions, Router } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withI18nSupport } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LocaleInterceptor } from './core/interceptors/locale.interceptor';
import { CustomRouteReuseStrategy } from './route.reuse.strategy';
import { TitleStrategy } from '@angular/router';
import { AppTitleStrategy } from './core/strategies/title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, to }) => {
          // Let routes with their own entrance animate without a page snapshot over them.
          if (to.firstChild?.data['skipViewTransition']) {
            transition.skipTransition();
            return;
          }

          const router = inject(Router);
          const targetUrl = router.currentNavigation()!.finalUrl!;
          // Skip transition if only fragment or query params change
          const config = {
            paths: 'exact',
            matrixParams: 'exact',
            fragment: 'ignored',
            queryParams: 'ignored',
          } as const;

          if (router.isActive(targetUrl, config)) {
            transition.skipTransition();
          }
        }
      }),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    provideClientHydration(withI18nSupport(), withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: LocaleInterceptor, multi: true },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ]
};
