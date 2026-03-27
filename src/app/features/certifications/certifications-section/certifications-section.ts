import { Component, inject } from '@angular/core';
import { AosAnimations } from '../../../shared/animations/aos-animation';
import { CursorSpotlight } from '../../../shared/animations/cursor-spotlight';
import { CertificationsService } from '../../../core/services/certifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Certification } from '../../../core/models/certification';
import { CertificationItem } from '../certification-item/certification-item';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-certifications-section',
  imports: [CertificationItem, RouterLink, AosAnimations, CursorSpotlight],
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
