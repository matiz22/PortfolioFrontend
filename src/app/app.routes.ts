import { Routes } from '@angular/router';
import { HomePage } from './features/home-page/home-page';

export const routes: Routes = [
    // HomePage loads eagerly for fast initial load
    {
        path: '',
        component: HomePage,
        title: $localize`:@@homeTitleMeta:Mateusz Malich | Freelance Developer & AI Enthusiast`,
        data: { reuse: true },
    },
    // All other features are lazy loaded
    {
        path: 'projects',
        loadChildren: () =>
            import('./features/projects/projects.routes').then(
                (m) => m.PROJECTS_ROUTES
            ),
    },
    {
        path: 'project',
        loadChildren: () =>
            import('./features/projects/projects.routes').then(
                (m) => m.PROJECTS_ROUTES
            ),
    },
    {
        path: 'realizations',
        loadChildren: () =>
            import('./features/realizations/realizations.routes').then(
                (m) => m.REALIZATIONS_ROUTES
            ),
    },
    {
        path: 'realization',
        loadChildren: () =>
            import('./features/realizations/realizations.routes').then(
                (m) => m.REALIZATIONS_ROUTES
            ),
    },
    {
        path: 'education',
        loadChildren: () =>
            import('./features/education/education.routes').then(
                (m) => m.EDUCATION_ROUTES
            ),
    },
    {
        path: 'certifications',
        loadChildren: () =>
            import('./features/certifications/certifications.routes').then(
                (m) => m.CERTIFICATIONS_ROUTES
            ),
    },
    {
        path: 'certification',
        loadChildren: () =>
            import('./features/certifications/certifications.routes').then(
                (m) => m.CERTIFICATIONS_ROUTES
            ),
    },
    {
        path: 'jobs',
        loadChildren: () =>
            import('./features/jobs/jobs.routes').then((m) => m.JOBS_ROUTES),
    },
    {
        path: 'job',
        loadChildren: () =>
            import('./features/jobs/jobs.routes').then((m) => m.JOBS_ROUTES),
    },
    {
        path: 'privacy-policy',
        loadComponent: () =>
            import('./shared/privacy-policy/privacy-policy').then(
                (m) => m.PrivacyPolicy
            ),
    },
];
