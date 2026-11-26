import {HttpInterceptorFn} from '@angular/common/http';
import {inject, LOCALE_ID} from '@angular/core';

/**
 * Attaches the active app locale to every outgoing request so the API can
 * return localized content. Runs in an injection context, so the locale is
 * resolved per request without keeping a class instance alive.
 */
export const localeInterceptor: HttpInterceptorFn = (req, next) => {
  const locale = inject(LOCALE_ID);
  return next(req.clone({
    setHeaders: {
      'Accept-Language': locale
    }
  }));
};
