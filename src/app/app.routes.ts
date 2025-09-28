import {Routes} from '@angular/router';
import {HomePage} from './features/home-page/home-page';
import {ProjectDetailsPage} from './features/projects/project-details-page/project-details-page';
import {ProjectListPage} from './features/projects/project-list-page/project-list-page';
import {RealizationDetailsPage} from './features/realizations/realization-details-page/realization-details-page';
import {JobDetailsPage} from './features/jobs/job-details-page/job-details-page';
import {EducationDetailsPage} from './features/education/education-details-page/education-details-page';
import {
  CertificationDetailsPage
} from './features/certifications/certification-details-page/certification-details-page';
import {AboutMePage} from './features/about-me/about-me-page/about-me-page';
import {ContactPage} from './shared/contact/contact-page/contact-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    data: {reuse: true}
  },
  {
    path: 'project/:id',
    component: ProjectDetailsPage
  },
  {
    path: 'projects',
    component: ProjectListPage
  },
  {
    path: 'realization/:id',
    component: RealizationDetailsPage,
  },
  {
    path: 'job/:id',
    component: JobDetailsPage,
  },
  {
    path: 'education/:id',
    component: EducationDetailsPage,
  },
  {
    path: 'certification/:id',
    component: CertificationDetailsPage,
  },
  {
    path: 'about-me',
    component: AboutMePage
  },
  {
    path: 'contact',
    component: ContactPage
  },
];
