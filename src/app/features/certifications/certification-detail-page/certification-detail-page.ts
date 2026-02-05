import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CertificationsService } from '../../../core/services/certifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Certification } from '../../../core/models/certification';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { SkillsDetailsSection } from '../../skills/skills-details-section/skills-details-section';
import { TechnologiesDetailsSection } from '../../technologies/technologies-details-section/technologies-details-section';
import { DatePipe } from '@angular/common';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from '../../../shared/loading/loading-details-page/loading-details-page';

@Component({
  selector: 'app-certification-detail-page',
  imports: [
    ImageUrlPipe,
    RouterLink,
    Header,
    Footer,
    DescriptionMd,
    SkillsDetailsSection,
    TechnologiesDetailsSection,
    DatePipe,
    ContactSection,
    LoadingDetailsPage
  ],
  templateUrl: './certification-detail-page.html',
  styleUrl: './certification-detail-page.scss',
})
export class CertificationDetailPage {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private certificationsService: CertificationsService = inject(CertificationsService);

  certification = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Certification>('No certification ID provided'));
        }
        return this.certificationsService.getById(id);
      })
    ),
    { initialValue: ApiState.loading<Certification>() }
  );
}
