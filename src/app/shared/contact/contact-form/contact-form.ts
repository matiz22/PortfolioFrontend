import { Component, inject, signal } from '@angular/core';
import { ContactService } from '../../../core/services/contact.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Contact } from '../../../core/models/contact';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  fb = inject(FormBuilder);
  contactService = inject(ContactService);

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    subject: ['', [Validators.required, Validators.maxLength(255)]],
    message: ['', [Validators.required, Validators.maxLength(5000)]],
    company: ['']
  });

  touchedFields: { [key: string]: boolean } = {};

  onBlur(fieldName: string) {
    this.touchedFields[fieldName] = true;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (!control) return '';

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

  submitted = signal<boolean | null>(null);
  submitting = signal<boolean>(false);

  onSubmit() {
    if (this.submitting()) return;

    if (this.contactForm.valid) {
      const contact = this.contactForm.value as Contact;
      this.submitting.set(true);
      this.contactService.sendEmail(contact).subscribe(success => {
        this.submitting.set(false);
        this.submitted.set(success);
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
