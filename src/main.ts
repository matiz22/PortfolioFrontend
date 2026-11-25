/// <reference types="@angular/localize" />

import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {App} from './app/app';
import {stabilizeFirefoxIosViewport} from './app/core/firefox-ios-viewport';

const stopViewportFix = stabilizeFirefoxIosViewport(window);
bootstrapApplication(App, appConfig)
  .then((app) => app.onDestroy(stopViewportFix))
  .catch((err) => {
    stopViewportFix();
    console.error(err);
  });
