import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withInMemoryScrolling, withViewTransitions, Router } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withI18nSupport, withIncrementalHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { LocaleInterceptor } from './core/interceptors/locale.interceptor';
import { CustomRouteReuseStrategy } from './route.reuse.strategy';
import { TitleStrategy } from '@angular/router';
import { AppTitleStrategy } from './core/strategies/title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => {
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
    provideClientHydration(withIncrementalHydration()),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    { provide: HTTP_INTERCEPTORS, useClass: LocaleInterceptor, multi: true },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ]
};

