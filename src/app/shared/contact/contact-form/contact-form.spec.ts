import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactForm } from './contact-form';
import { ContactService } from '../../../core/services/contact.service';
import { of, Subject } from 'rxjs';

describe('ContactForm', () => {
  let component: ContactForm;
  let fixture: ComponentFixture<ContactForm>;
  let service: jasmine.SpyObj<ContactService>;
  let result: Subject<boolean>;

  beforeEach(async () => {
    result = new Subject<boolean>();
    service = jasmine.createSpyObj<ContactService>('ContactService', ['sendEmail']);
    service.sendEmail.and.returnValue(result.asObservable());
    await TestBed.configureTestingModule({
      imports: [ContactForm],
      providers: [
        { provide: ContactService, useValue: service },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactForm);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stacks identity fields by default', () => {
    const fields: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.contact-identity');
    expect(fields[1].getBoundingClientRect().top).toBeGreaterThan(
      fields[0].getBoundingClientRect().top,
    );
  });

  it('can place name and email on one row while keeping the remaining fields full-width', () => {
    const host: HTMLElement = fixture.nativeElement;
    host.style.setProperty('--contact-form-columns', 'repeat(2, minmax(0, 1fr))');
    const fields = host.querySelectorAll<HTMLElement>('.contact-identity');
    const name = fields[0].getBoundingClientRect();
    const email = fields[1].getBoundingClientRect();
    const subject = host.querySelector('#contact-subject')!.getBoundingClientRect();
    expect(name.top).toBe(email.top);
    expect(email.left).toBeGreaterThan(name.left);
    expect(subject.width).toBeGreaterThan(name.width);
  });

  it('keeps validation messages in the form flow', async () => {
    const host: HTMLElement = fixture.nativeElement;
    host.style.setProperty('--contact-form-columns', 'repeat(2, minmax(0, 1fr))');
    const form = host.querySelector('form')!;
    const initialHeight = form.getBoundingClientRect().height;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(host.querySelectorAll('.text-error').length).toBe(4);
    expect(form.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
  });

  function submitValidForm(): void {
    component.contactForm.setValue({
      name: 'Ada Lovelace', email: 'ada@example.com', subject: 'A project', message: 'Let’s build it.', company: '',
    });
    submit();
  }

  function submit(): void {
    fixture.nativeElement.querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  it('focuses the first invalid field and associates each visible error with its control', async () => {
    submit();
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    expect(document.activeElement).toBe(root.querySelector('#contact-name'));
    for (const field of ['name', 'email', 'subject', 'message']) {
      const control = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#contact-${field}`)!;
      expect(control.required).toBeTrue();
      expect(control.getAttribute('aria-invalid')).toBe('true');
      expect(control.getAttribute('aria-describedby')).toBe(`contact-${field}-error`);
      expect(root.querySelector(`#contact-${field}-error`)?.textContent).toContain('Field is required');
    }
    expect(service.sendEmail).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only fields using the existing required validation', async () => {
    component.contactForm.setValue({
      name: '   ', email: '\t ', subject: '\n  ', message: '  \r\n ', company: '',
    });
    submit();
    await fixture.whenStable();

    expect(service.sendEmail).not.toHaveBeenCalled();
    expect(component.contactForm.getRawValue()).toEqual({
      name: '', email: '', subject: '', message: '', company: '',
    });
    expect(fixture.nativeElement.querySelectorAll('.text-error').length).toBe(4);
    for (const field of ['name', 'email', 'subject', 'message'] as const) {
      expect(component.contactForm.controls[field].hasError('required')).toBeTrue();
    }
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('#contact-name'));
  });

  it('trims submitted values without changing meaningful internal whitespace', async () => {
    component.contactForm.setValue({
      name: '  Ada Lovelace\n', email: '  ada@example.com\t', subject: '  A project  ',
      message: '  Let’s build it.\nKeep this line.  ', company: '  ',
    });
    submit();
    await fixture.whenStable();

    expect(service.sendEmail).toHaveBeenCalledOnceWith({
      name: 'Ada Lovelace', email: 'ada@example.com', subject: 'A project',
      message: 'Let’s build it.\nKeep this line.', company: '',
    });
  });

  it('sends non-null form values once and announces pending submission', async () => {
    submitValidForm();
    submit();
    await fixture.whenStable();

    expect(service.sendEmail).toHaveBeenCalledOnceWith({
      name: 'Ada Lovelace', email: 'ada@example.com', subject: 'A project', message: 'Let’s build it.', company: '',
    });
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBeTrue();
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Sending...');
  });

  it('focuses the announced success message after replacing the form', async () => {
    submitValidForm();
    result.next(true);
    result.complete();
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const success = root.querySelector<HTMLElement>('[aria-labelledby="contact-success-title"]')!;
    expect(root.querySelector('form')).toBeNull();
    expect(success.getAttribute('role')).toBe('status');
    expect(document.activeElement).toBe(success);
    expect(component.submitting()).toBeFalse();
  });

  it('announces failures, keeps entered data, and allows retry', async () => {
    submitValidForm();
    result.next(false);
    result.complete();
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Failed to send message');
    expect(component.contactForm.controls.message.value).toBe('Let’s build it.');
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBeFalse();

    service.sendEmail.and.returnValue(of(true));
    submit();
    await fixture.whenStable();
    expect(service.sendEmail).toHaveBeenCalledTimes(2);
    expect(root.querySelector('#contact-success-title')).not.toBeNull();
  });

  it('cancels the pending subscription on destruction and ignores late responses', () => {
    submitValidForm();
    expect(result.observed).toBeTrue();
    fixture.destroy();

    expect(result.observed).toBeFalse();
    expect(component.submitting()).toBeFalse();
    result.next(true);
    expect(component.submitted()).toBeNull();
  });

  it('resets all form values to strings', () => {
    component.contactForm.reset();
    expect(component.contactForm.getRawValue()).toEqual({ name: '', email: '', subject: '', message: '', company: '' });
  });
});
