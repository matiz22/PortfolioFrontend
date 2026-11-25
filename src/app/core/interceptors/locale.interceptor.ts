import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {inject, Injectable, LOCALE_ID} from '@angular/core';

@Injectable()
export class LocaleInterceptor implements HttpInterceptor {
  readonly locale = inject(LOCALE_ID);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const clonedRequest = req.clone({
      setHeaders: {
        'Accept-Language': this.locale
      }
    });

    return next.handle(clonedRequest);
  }
}
