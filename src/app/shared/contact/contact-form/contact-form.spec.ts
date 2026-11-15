import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactForm } from './contact-form';
import { ContactService } from '../../../core/services/contact.service';

describe('ContactForm', () => {
  let component: ContactForm;
  let fixture: ComponentFixture<ContactForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactForm],
      providers: [
        { provide: ContactService, useValue: jasmine.createSpyObj('ContactService', ['sendEmail']) },
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
});
