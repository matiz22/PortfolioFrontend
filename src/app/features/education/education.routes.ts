import { Routes } from '@angular/router';

export const EDUCATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./education-page/education-page').then((m) => m.EducationPage),
        data: { reuse: true },
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./education-details-page/education-details-page').then(
                (m) => m.EducationDetailsPage
            ),
    },
];
