import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CertificationsService } from '../../../core/services/certifications.service';
import { Certification } from '../../../core/models/certification';
import { ApiState } from '../../../core/models/api.state';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { CertificationItem } from '../certification-item/certification-item';

@Component({
  selector: 'app-certifications-page',
  imports: [Header, Footer, ContactSection, CertificationItem],
  templateUrl: './certifications-page.html',
  styleUrl: './certifications-page.scss',
})
export class CertificationsPage {
  private certificationsService = inject(CertificationsService);

  certifications = toSignal(
    this.certificationsService.getAll(),
    {
      initialValue: ApiState.loading<Certification[]>()
    }
  );
}
