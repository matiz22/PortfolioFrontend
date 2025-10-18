import {Component, computed, inject} from '@angular/core';
import {ItemDetailsPage} from '../../../shared/showcase/item-details-page/item-details-page';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {of, switchMap} from 'rxjs';
import {CertificationsService} from '../../../core/services/certifications.service';
import {Link} from '../../../shared/models/link';
import {ApiState} from '../../../core/models/api.state';
import {Certification} from '../../../core/models/certification';
import {LoadingCircle} from '../../../shared/loading/loading-circle/loading-circle';
import {NetworkError} from '../../../shared/errors/network-error/network-error';

@Component({
  selector: 'app-certification-details-page',
  imports: [
    ItemDetailsPage,
    LoadingCircle,
    NetworkError
  ],
  templateUrl: './certification-details-page.html',
  styleUrl: './certification-details-page.scss'
})
export class CertificationDetailsPage {
  private readonly educationService = inject(CertificationsService);
  private readonly route = inject(ActivatedRoute);

  certification = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Certification>('No certification ID provided'));
        }
        return this.educationService.getById(id);
      })
    ),
    {initialValue: ApiState.loading<Certification>()}
  );


  private readonly certLinkButtonLabel = `:@@certLinkButton: Certificate link`;


  links = computed<Link[]>(() => {
    const certificationState = this.certification();

    // Only show links when we have successful data with a credential URL
    if (certificationState?.status === 'success' && certificationState.data?.credentialUrl) {
      return [{
        name: this.certLinkButtonLabel,
        url: certificationState.data.credentialUrl,
        mat_icon: 'workspace_premium'
      }];
    }

    return [];
  });
}
