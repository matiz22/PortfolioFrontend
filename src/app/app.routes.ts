import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';

export const routes: Routes = [
    // HomePage loads eagerly for fast initial load
    {
        path: '',
        component: HomePage,
        title: $localize`:@@homeTitleMeta:Mateusz Malich | Apps, Websites & AI Solutions`,
        data: { reuse: true },
    },
    {
        path: 'projects',
        loadComponent: () =>
            import('./features/projects/projects-page/projects-page').then(
                (m) => m.ProjectsPage
            ),
        title: $localize`:@@projectsTitleMeta:Projects | Mateusz Malich`,
        data: { reuse: true },
    },
    {
        path: 'project/:id',
        loadComponent: () =>
            import('./features/projects/project-details-page/project-details-page').then(
                (m) => m.ProjectDetailsPage
            ),
    },
    {
        path: 'realizations',
        loadComponent: () =>
            import('./features/realizations/realizations-page/realizations-page').then(
                (m) => m.RealizationsPage
            ),
        title: $localize`:@@realizationsTitleMeta:Realizations | Mateusz Malich`,
        data: { reuse: true },
    },
    {
        path: 'realization/:id',
        loadComponent: () =>
            import('./features/realizations/realization-details-page/realization-details-page').then(
                (m) => m.RealizationDetailsPage
            ),
    },
    {
        path: 'education',
        loadComponent: () =>
            import('./features/education/education-page/education-page').then(
                (m) => m.EducationPage
            ),
        title: $localize`:@@educationTitleMeta:Education | Mateusz Malich`,
        data: { reuse: true },
    },
    {
        path: 'education/:id',
        loadComponent: () =>
            import('./features/education/education-details-page/education-details-page').then(
                (m) => m.EducationDetailsPage
            ),
    },
    {
        path: 'certifications',
        loadComponent: () =>
            import('./features/certifications/certifications-page/certifications-page').then(
                (m) => m.CertificationsPage
            ),
        title: $localize`:@@certificationsTitleMeta:Certifications | Mateusz Malich`,
        data: { reuse: true },
    },
    {
        path: 'certification/:id',
        loadComponent: () =>
            import('./features/certifications/certification-detail-page/certification-detail-page').then(
                (m) => m.CertificationDetailPage
            ),
    },
    {
        path: 'jobs',
        loadComponent: () =>
            import('./features/jobs/jobs-page/jobs-page').then((m) => m.JobsPage),
        title: $localize`:@@jobsTitleMeta:Experience | Mateusz Malich`,
        data: { reuse: true },
    },
    {
        path: 'job/:id',
        loadComponent: () =>
            import('./features/jobs/job-details-page/job-details-page').then(
                (m) => m.JobDetailsPage
            ),
    },
    {
        path: 'privacy-policy',
        loadComponent: () =>
            import('./shared/privacy-policy/privacy-policy').then(
                (m) => m.PrivacyPolicy
            ),
    },
];
