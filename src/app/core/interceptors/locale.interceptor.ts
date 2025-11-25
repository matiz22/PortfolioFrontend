import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Inject, Injectable, LOCALE_ID} from '@angular/core';

@Injectable()
export class LocaleInterceptor implements HttpInterceptor {
  constructor(
    @Inject(LOCALE_ID) public locale: string
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      setHeaders: {
        'Accept-Language': this.locale
      }
    });

    return next.handle(clonedRequest);
  }
}
