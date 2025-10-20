import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CertificationItem} from '../certification-item/certification-item';
import {CertificationsService} from '../../../core/services/certifications.service';
import {Certification} from '../../../core/models/certification';
import {ApiState} from '../../../core/models/api.state';
import {NotFound} from '../../../shared/errors/not-found/not-found';
import {NetworkError} from '../../../shared/errors/network-error/network-error';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';
import {AosAnimations} from '../../../shared/animations/aos-animations';

@Component({
  selector: 'app-certification-section',
  imports: [
    CertificationItem,
    NotFound,
    NetworkError,
    LoadingCircle,
    AosAnimations
  ],
  templateUrl: './certification-section.html',
  styleUrl: './certification-section.scss'
})
export class CertificationSection {
  certificationsService: CertificationsService = inject(CertificationsService);
  certifications = toSignal(this.certificationsService.getHomeItems(),
    {
      initialValue: ApiState.loading<Certification[]>()
    }
  );
}
