import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { EducationService } from '../../../core/services/education.service';
import { ApiState } from '../../../core/models/api.state';
import { Education } from '../../../core/models/education';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { DatePipe } from '@angular/common';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { SkillsDetailsSection } from '../../skills/skills-details-section/skills-details-section';
import { TechnologiesDetailsSection } from '../../technologies/technologies-details-section/technologies-details-section';


@Component({
  selector: 'app-education-details-page',
  imports: [
    Header,
    Footer,
    RouterLink,
    ImageUrlPipe,
    DatePipe,
    DescriptionMd,
    SkillsDetailsSection,
    TechnologiesDetailsSection
  ],
  templateUrl: './education-details-page.html',
  styleUrl: './education-details-page.scss'
})
export class EducationDetailsPage {
  private readonly educationService = inject(EducationService);
  private readonly route = inject(ActivatedRoute);
  education = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(ApiState.error<Education>('No certification ID provided'));
        }
        return this.educationService.getById(id);
      })
    ),
    { initialValue: ApiState.loading<Education>() }
  );
}