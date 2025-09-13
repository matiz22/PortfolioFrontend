import {Component, computed, inject} from '@angular/core';
import {ItemDetailsPage} from '../../../shared/showcase/item-details-page/item-details-page';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {of, switchMap} from 'rxjs';
import {CertificationsService} from '../../../core/services/certifications.service';
import {Link} from '../../../shared/models/link';

@Component({
  selector: 'app-certification-details-page',
  imports: [
    ItemDetailsPage
  ],
  templateUrl: './certification-details-page.html',
  styleUrl: './certification-details-page.scss'
})
export class CertificationDetailsPage {
  private readonly educationService = inject(CertificationsService);
  private readonly route = inject(ActivatedRoute);
  certification = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => params.get('id')
        ? this.educationService.getById(params.get('id')!)
        : of(null)
      )
    ),
    {initialValue: null}
  );


  private readonly certLinkButtonLabel = `:@@certLinkButton: Certificate link`;

  links = computed<Link[]>(() => {
    const certification = this.certification();
    if (!certification?.credentialUrl) return [];
    return [{
      name: this.certLinkButtonLabel,
      url: certification.credentialUrl,
      mat_icon: 'workspace_premium'
    }];
  });
}
