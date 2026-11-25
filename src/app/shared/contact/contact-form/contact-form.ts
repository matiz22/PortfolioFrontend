import {
  afterRenderEffect, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../../../core/services/contact.service';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly successMessage = viewChild<ElementRef<HTMLElement>>('successMessage');

  readonly contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    subject: ['', [Validators.required, Validators.maxLength(255)]],
    message: ['', [Validators.required, Validators.maxLength(5000)]],
    company: ['']
  });

  readonly submitted = signal<boolean | null>(null);
  readonly submitting = signal(false);
  private readonly invalidFocus = signal<{ field: keyof ContactForm['contactForm']['controls'] } | null>(null);

  constructor() {
    afterRenderEffect({
      write: () => {
        const invalid = this.invalidFocus();
        if (this.submitted() === true) {
          this.successMessage()?.nativeElement.focus();
        } else if (invalid) {
          // Focus after the error text and its associations are in the DOM.
          this.host.nativeElement.querySelector<HTMLElement>(`[formControlName="${invalid.field}"]`)?.focus();
        }
      },
    });
  }

  getErrorMessage(fieldName: keyof typeof this.contactForm.controls): string {
    const control = this.contactForm.controls[fieldName];

    if (control.hasError('required')) {
      return $localize`:@@requiredFieldError:Field is required`;
    }
    if (control.hasError('email')) {
      return $localize`:@@emailFieldError:Enter a valid email address`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return $localize`:@@lengthFieldError: Field cannot be longer than ${maxLength} characters`;
    }

    return '';
  }

  onSubmit(): void {
    if (this.submitting() || this.submitted() === true) return;

    const value = this.contactForm.getRawValue();
    const normalizedValue = {
      name: value.name.trim(),
      email: value.email.trim(),
      subject: value.subject.trim(),
      message: value.message.trim(),
      company: value.company.trim(),
    };
    this.contactForm.setValue(normalizedValue);

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      const firstInvalid = (Object.keys(this.contactForm.controls) as (keyof typeof this.contactForm.controls)[])
        .find((field) => this.contactForm.controls[field].invalid);
      if (firstInvalid) {
        this.invalidFocus.set({ field: firstInvalid });
      }
      return;
    }

    this.invalidFocus.set(null);
    this.submitted.set(null);
    this.submitting.set(true);
    this.contactService.sendEmail(normalizedValue).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.submitting.set(false)),
    ).subscribe({
      next: (success) => this.submitted.set(success),
      error: () => this.submitted.set(false),
    });
  }
}
