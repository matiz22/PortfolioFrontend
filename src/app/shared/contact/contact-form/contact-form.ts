import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {Contact} from '../../../core/models/contact';
import {ContactService} from '../../../core/services/contact.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.html',
  imports: [
    MatFormField,
    MatLabel,
    MatError,
    ReactiveFormsModule,
    MatButton,
    MatInput
  ],
  styleUrls: ['./contact-form.scss']
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
      return $localize`${fieldName} is required`;
    }
    if (control.hasError('email')) {
      return $localize`Please enter a valid email address`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return $localize`${fieldName} cannot be longer than ${maxLength} characters`;
    }

    return '';
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const contact = this.contactForm.value as Contact;
      this.contactService.sendEmail(contact).subscribe(success => console.log('Email success:', success))
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
