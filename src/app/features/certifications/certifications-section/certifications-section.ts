import { Component, inject } from '@angular/core';
import { CertificationsService } from '../../../core/services/certifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Certification } from '../../../core/models/certification';
import { CertificationItem } from '../certification-item/certification-item';

@Component({
  selector: 'app-certifications-section',
  imports: [CertificationItem],
  templateUrl: './certifications-section.html',
  styleUrl: './certifications-section.scss',
})
export class CertificationsSection {
  private certificationsService = inject(CertificationsService);

  certifications = toSignal(
    this.certificationsService.getHomeItems(),
    {
      initialValue: ApiState.loading<Certification[]>()
    }
  );
}
