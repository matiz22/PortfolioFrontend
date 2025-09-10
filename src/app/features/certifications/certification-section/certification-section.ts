import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CertificationItem} from '../certification-item/certification-item';
import {CertificationsService} from '../../../core/services/certifications.service';
import {Certification} from '../../../core/models/certification';

@Component({
  selector: 'app-certification-section',
  imports: [
    CertificationItem
  ],
  templateUrl: './certification-section.html',
  styleUrl: './certification-section.scss'
})
export class CertificationSection {
  certificationsService: CertificationsService = inject(CertificationsService);
  certifications = toSignal(this.certificationsService.getHomeItems(), {initialValue: [] as Certification[]});
}
