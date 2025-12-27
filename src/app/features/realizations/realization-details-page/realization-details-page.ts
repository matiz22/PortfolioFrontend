import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RealizationsService } from '../../../core/services/realizations.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Realization } from '../../../core/models/realization';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Link } from '../../../shared/models/link';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { SkillsDetailsSection } from '../../skills/skills-details-section/skills-details-section';
import { TechnologiesDetailsSection } from '../../technologies/technologies-details-section/technologies-details-section';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';

@Component({
  selector: 'app-realization-details-page',
  imports: [ImageUrlPipe, RouterLink, Header, Footer, DescriptionMd, SkillsDetailsSection, TechnologiesDetailsSection, ContactSection],
  templateUrl: './realization-details-page.html',
  styleUrl: './realization-details-page.scss',
})
export class RealizationDetailsPage {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private realizationsService: RealizationsService = inject(RealizationsService);

  realization = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Realization>('No realization ID provided'));
        }
        return this.realizationsService.getById(id);
      })
    ),
    { initialValue: ApiState.loading<Realization>() }
  );

  private readonly clientButtonLabel = $localize`:@@clientButton:Client website`;
  links = computed<Link[]>(() => {
    const realizationState = this.realization();

    if (realizationState.status === 'success' && realizationState.data.clientUrl) {
      return [{
        name: this.clientButtonLabel,
        url: realizationState.data.clientUrl,
        mat_icon: 'contacts_product'
      }];
    }

    return [];
  });
}