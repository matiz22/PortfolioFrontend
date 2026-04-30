import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobsService } from '../../../core/services/jobs.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Job } from '../../../core/models/job';
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
import { LoadingDetailsPage } from "../../../shared/loading/loading-details-page/loading-details-page";

@Component({
  selector: 'app-job-details-page',
  imports: [ImageUrlPipe, RouterLink, Header, Footer, DescriptionMd, SkillsDetailsSection, TechnologiesDetailsSection, DatePipe, ContactSection, LoadingDetailsPage],
  templateUrl: './job-details-page.html',
  styleUrl: './job-details-page.scss',
})
export class JobDetailsPage {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private jobsService: JobsService = inject(JobsService);

  job = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug');
        if (!slug) {
          return of(ApiState.error<Job>('No job slug provided'));
        }
        return this.jobsService.getBySlug(slug);
      })
    ),
    { initialValue: ApiState.loading<Job>() }
  );
}
