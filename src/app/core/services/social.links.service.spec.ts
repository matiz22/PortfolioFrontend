import {HttpErrorResponse, HttpInterceptorFn, HttpRequest, provideHttpClient, withInterceptors} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {throwError} from 'rxjs';

import {SocialLinksService} from './social.links.service';

describe('SocialLinksService', () => {
  let service: SocialLinksService;
  let request: HttpRequest<unknown>;

  beforeEach(() => {
    const simulateTimeout: HttpInterceptorFn = req => {
      request = req;
      return throwError(() => new HttpErrorResponse({
        error: new DOMException('Request timed out', 'TimeoutError'),
        status: 0,
        url: req.url,
      }));
    };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([simulateTimeout]))],
    });
    service = TestBed.inject(SocialLinksService);
  });

  it('bounds the social links request and turns a timeout into an error state', () => {
    const result = jasmine.createSpy('result');
    service.getAll().subscribe(result);

    expect(request.url).toMatch(/\/social-links\/translated$/);
    expect(request.timeout).toBe(5_000);
    expect(result).toHaveBeenCalledOnceWith(jasmine.objectContaining({status: 'error'}));
  });
});
