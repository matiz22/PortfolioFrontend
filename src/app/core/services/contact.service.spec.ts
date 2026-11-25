import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Contact } from '../models/contact';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/${environment.version}/send-email`;
  const contact: Contact = {
    name: 'Ada Lovelace', email: 'ada@example.com', subject: 'A project', message: 'Let’s build it.', company: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps the contact form to the existing email payload', () => {
    const received = jasmine.createSpy('result');
    service.sendEmail(contact).subscribe(received);

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      form_name: 'contact_form', from_name: contact.name, from_email: contact.email,
      subject: contact.subject, message: contact.message,
    });
    request.flush({ accepted: true });
    expect(received).toHaveBeenCalledOnceWith(true);
  });

  it('returns a recoverable failure when the endpoint rejects submission', () => {
    const received = jasmine.createSpy('result');
    service.sendEmail(contact).subscribe(received);
    http.expectOne(url).flush({}, { status: 503, statusText: 'Service unavailable' });
    expect(received).toHaveBeenCalledOnceWith(false);
  });

  it('acknowledges a filled honeypot without sending a request', () => {
    const received = jasmine.createSpy('result');
    service.sendEmail({ ...contact, company: 'A bot filled this' }).subscribe(received);
    http.expectNone(url);
    expect(received).toHaveBeenCalledOnceWith(true);
  });

  it('accepts whitespace in the honeypot as an empty value', () => {
    service.sendEmail({ ...contact, company: '  ' }).subscribe();
    http.expectOne(url).flush(null);
  });
});
