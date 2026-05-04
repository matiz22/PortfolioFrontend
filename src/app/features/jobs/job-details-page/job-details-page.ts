import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../../core/models/api.state';
import { Job } from '../../../core/models/job';
import { map } from 'rxjs/operators';
import { ImageUrlPipe } from '../../../shared/pipes/image-url-pipe';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { DescriptionMd } from '../../../shared/description/description-md/description-md';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ContactSection } from '../../../shared/contact/contact-section/contact-section';
import { LoadingDetailsPage } from "../../../shared/loading/loading-details-page/loading-details-page";
import { SeoService } from '../../../core/services/seo.service';
import { buildSeoFromModel } from '../../../core/resolvers/seo.resolver';

@Component({
  selector: 'app-job-details-page',
  imports: [ImageUrlPipe, RouterLink, Header, Footer, DescriptionMd, DatePipe, ContactSection, LoadingDetailsPage],
  templateUrl: './job-details-page.html',
  styleUrl: './job-details-page.scss',
})
export class JobDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  constructor() {
    const state = this.route.snapshot.data['jobState'] as ApiState<Job>;
    if (state?.status === 'success') {
      const seo = buildSeoFromModel(state.data, `${state.data.title} at ${state.data.companyName}`);
      this.seoService.updateMeta(seo);
    }
  }

  // Data is now provided by the resolver to ensure SSR captures SEO tags
  job = toSignal(
    this.route.data.pipe(map(d => d['jobState'] as ApiState<Job>)),
    { initialValue: ApiState.loading<Job>() }
  );

  private readonly jobData = computed(() => {
    const state = this.job();
    return state.status === 'success' ? state.data : null;
  });
}
