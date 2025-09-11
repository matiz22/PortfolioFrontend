import {Contact} from '../models/contact';
import {EmailDto} from '../dto/contact.dto';

export function mapContactDto(contact: Contact, form_name: string): EmailDto {
  return {
    form_name: form_name,
    from_email: contact.email,
    from_name: contact.name,
    subject: contact.subject,
    message: contact.message,
  };
}
