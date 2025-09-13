import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, RouteReuseStrategy, withInMemoryScrolling, withViewTransitions} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {ProjectsService} from './core/services/projects.service';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {MAT_RIPPLE_GLOBAL_OPTIONS} from '@angular/material/core';
import {CustomRouteReuseStrategy} from './route.reuse.strategy';
import {provideMarkdown} from 'ngx-markdown';
import {provideServerRendering} from '@angular/ssr';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MAT_RIPPLE_GLOBAL_OPTIONS,
      useValue: {
        animation: {
          enterDuration: 1000,
          exitDuration: 1000
        }
      }
    },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
          scrollPositionRestoration: 'enabled',
        }
      ),
    ),
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
    provideClientHydration(withEventReplay()),
    provideServerRendering(), 
    provideHttpClient(withFetch()),
    provideMarkdown(),
    ProjectsService
  ]
};
