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
    expect(fixture.nativeElement.querySelector('.home-glass')).toBeNull();
  });

  it('uses the homepage wording without changing the copy on other pages', async () => {
    const host: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput('glass', true);
    await fixture.whenStable();
    expect(host.querySelector('#contact-heading')?.textContent).toContain("Let's Build");
    expect(host.querySelector('.contact-copy > p')?.textContent).toContain('Have a vision in mind?');

    fixture.componentRef.setInput('homeCopy', true);
    await fixture.whenStable();
    expect(host.querySelector('#contact-heading')?.textContent).toContain('Send me a note. We’ll take it from there.');
    expect(host.querySelector('.contact-copy > p')?.textContent).toContain('Share an idea');
  });

  it('opts the homepage copy and form into dark glass without frosting the section', async () => {
    fixture.componentRef.setInput('glass', true);
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    const card = host.querySelector<HTMLElement>('.contact-form-card')!;
    expect(card.classList).toContain('glass');
    expect(card.classList).toContain('home-glass');
    expect(host.querySelector('.contact-copy > p')?.classList).toContain('home-copy-panel');
    expect(host.querySelector('.contact-section')?.classList).not.toContain('glass');
    expect(getComputedStyle(card).backdropFilter).toContain('blur(');
    expect(getComputedStyle(card).borderTopStyle).toBe('solid');
  });

  it('frosts the email chip for the homepage', async () => {
    fixture.componentRef.setInput('glass', true);
    await fixture.whenStable();

    const email = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLAnchorElement>('a[href^="mailto:"]')!;
    expect(email.classList).toContain('glass');
    expect(email.classList).toContain('home-glass-chip');
    expect(getComputedStyle(email).backdropFilter).toContain('blur(');
    expect(getComputedStyle(email).borderTopStyle).toBe('solid');
  });

  it('keeps the glass form card over a transparent, divider-free section', async () => {
    const host: HTMLElement = fixture.nativeElement;
    host.classList.add('contact-blended');
    fixture.componentRef.setInput('glass', true);
    await fixture.whenStable();

    const section = getComputedStyle(host.querySelector('.contact-section')!);
    const card = getComputedStyle(host.querySelector('.contact-form-card')!);
    expect(section.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(section.borderTopWidth).toBe('0px');
    expect(card.backgroundColor).not.toBe(section.backgroundColor);
    expect(card.borderTopWidth).toBe('1px');
    expect(card.backdropFilter).toContain('blur(');
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
