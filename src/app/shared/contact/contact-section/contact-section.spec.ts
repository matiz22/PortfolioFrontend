import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSection } from './contact-section';
import { ContactForm } from '../contact-form/contact-form';
import { ContactService } from '../../../core/services/contact.service';

describe('ContactSection', () => {
  let component: ContactSection;
  let fixture: ComponentFixture<ContactSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactSection],
      providers: [
        { provide: ContactService, useValue: jasmine.createSpyObj('ContactService', ['sendEmail']) },
      ],
    })
    .overrideComponent(ContactSection, {
      set: { imports: [ContactForm], schemas: [NO_ERRORS_SCHEMA] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactSection);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('retains the default contact spacing outside the home page', () => {
    const section: HTMLElement = fixture.nativeElement.querySelector('.contact-section');
    expect(getComputedStyle(section).paddingTop).toBe('128px');
    expect(getComputedStyle(section).paddingBottom).toBe('128px');
  });

  it('allows the home page to compact the layout without changing its content', () => {
    const host: HTMLElement = fixture.nativeElement;
    host.style.setProperty('--contact-section-padding', '3rem');
    host.style.setProperty('--contact-card-padding', '2rem');
    host.style.setProperty('--contact-copy-position', 'static');

    const section = host.querySelector<HTMLElement>('.contact-section')!;
    const card = host.querySelector<HTMLElement>('.contact-form-card')!;
    expect(getComputedStyle(section).paddingTop).toBe('48px');
    expect(getComputedStyle(card).paddingTop).toBe('32px');
    expect(getComputedStyle(host.querySelector('.contact-copy')!).position).toBe('static');
    expect(section.getAttribute('aria-labelledby')).toBe('contact-heading');
    expect(host.querySelector('#contact-heading')).not.toBeNull();
    expect(host.querySelectorAll('input:not([type="hidden"]), textarea').length).toBe(5);
  });
});
